import React, { useEffect, useRef, useState } from 'react';
import FacePanel from './FacePanel';

export interface DetectResponse {
    success: boolean;
    face_detected: boolean;
    motion_detected: boolean;
    motion_pixels: number;
    studying: boolean;
    not_studying_count: number;
    not_studying_seconds: number;
    stopped: boolean;
}

export interface FaceDetectorProps {
    onClose?: () => void;
    onDetectionResult?: (result: DetectResponse) => void;
    onDetectionEnd?: () => void;
}

const DETECT_API = 'http://192.168.0.84:8000/ai/detect';

const FaceDetector: React.FC<FaceDetectorProps> = ({ onClose, onDetectionResult, onDetectionEnd }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef(false);
    const cameraVersionRef = useRef(0);
    const startingCameraRef = useRef(false);
    const cancelDetectionRef = useRef<(() => void) | null>(null);
    const callbacksRef = useRef({ onClose, onDetectionResult, onDetectionEnd });
    callbacksRef.current = { onClose, onDetectionResult, onDetectionEnd };
    const [cameraActive, setCameraActive] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [movementDetected, setMovementDetected] = useState(false);
    const [studying, setStudying] = useState(false);

    const stopDetection = () => {
        cancelDetectionRef.current?.();
        setDetecting(false);
        setFaceDetected(false);
        setMovementDetected(false);
        setStudying(false);
    };

    const stopCamera = () => {
        cameraVersionRef.current += 1;
        startingCameraRef.current = false;
        stopDetection();
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraActive(false);
    };

    const startCamera = async () => {
        if (startingCameraRef.current || streamRef.current) return;
        startingCameraRef.current = true;
        const version = ++cameraVersionRef.current;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (!mountedRef.current || version !== cameraVersionRef.current) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            streamRef.current = stream;
            const video = videoRef.current;
            if (!video) throw new Error('카메라 화면이 없습니다.');
            video.srcObject = stream;
            await video.play();
            if (mountedRef.current && version === cameraVersionRef.current) setCameraActive(true);
        } catch (error) {
            if (!mountedRef.current || version !== cameraVersionRef.current) return;
            stopCamera();
            alert('카메라를 사용할 수 없습니다.');
        } finally {
            if (version === cameraVersionRef.current) startingCameraRef.current = false;
        }
    };

    const startDetection = () => {
        if (!cameraActive) {
            alert('먼저 카메라를 실행해주세요.');
            return;
        }
        setDetecting(true);
    };

    useEffect(() => {
        if (!detecting) return;
        let active = true;
        let sessionId: string | null = null;
        let timer: number | undefined;
        const controller = new AbortController();
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;

        const deleteSession = (id: string) => {
            void fetch(`${DETECT_API}/sessions`, {
                method: 'DELETE', headers: { 'X-Detect-Session': id }, keepalive: true
            }).catch(() => { /* 실패 시 서버 TTL로 정리됩니다. */ });
        };
        const cancel = () => {
            if (!active) return;
            active = false;
            window.clearTimeout(timer);
            controller.abort();
            if (sessionId) deleteSession(sessionId);
            callbacksRef.current.onDetectionEnd?.();
        };
        cancelDetectionRef.current = cancel;

        const fail = () => {
            if (!active) return;
            stopCamera();
            alert('학습 집중 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
            callbacksRef.current.onClose?.();
        };

        const detect = async () => {
            try {
                const video = videoRef.current;
                if (video && video.readyState >= 2 && video.videoWidth > 0) {
                    const context = canvas.getContext('2d');
                    if (!context) throw new Error('이미지 변환 실패');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const blob = await new Promise<Blob | null>(resolve =>
                        canvas.toBlob(resolve, 'image/jpeg', 0.8));
                    if (!active) return;
                    if (!blob) throw new Error('이미지 변환 실패');
                    const formData = new FormData();
                    formData.append('file', blob, 'frame.jpg');
                    const response = await fetch(`${DETECT_API}/focus`, {
                        method: 'POST', headers: { 'X-Detect-Session': sessionId! },
                        body: formData, signal: controller.signal
                    });
                    if (!response.ok) throw new Error(`감지 서버 오류: ${response.status}`);
                    const data: DetectResponse = await response.json();
                    if (!active) return;
                    if (!data.success) throw new Error('감지 실패');
                    setFaceDetected(data.face_detected);
                    setMovementDetected(data.motion_detected);
                    setStudying(data.studying);
                    // stopped여도 복귀를 감지하기 위해 요청을 계속합니다.
                    callbacksRef.current.onDetectionResult?.(data);
                }
                if (active) timer = window.setTimeout(detect, 1000);
            } catch (error) {
                fail();
            }
        };

        const start = async () => {
            try {
                // 종료 후 생성 응답이 오면 해당 세션도 삭제합니다.
                const response = await fetch(`${DETECT_API}/sessions`, { method: 'POST' });
                if (!response.ok) throw new Error(`세션 생성 오류: ${response.status}`);
                const data = await response.json();
                if (!data.success || typeof data.session_id !== 'string' || !data.session_id) {
                    throw new Error('유효하지 않은 감지 세션');
                }
                if (!active) {
                    deleteSession(data.session_id);
                    return;
                }
                sessionId = data.session_id;
                await detect();
            } catch (error) {
                fail();
            }
        };
        void start();
        return () => {
            cancel();
            if (cancelDetectionRef.current === cancel) cancelDetectionRef.current = null;
        };
        // 콜백 변경은 기존 감지 세션을 재생성하지 않습니다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detecting]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            cameraVersionRef.current += 1;
            cancelDetectionRef.current?.();
            streamRef.current?.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        };
    }, []);

    return (
        <FacePanel
            videoRef={videoRef} cameraActive={cameraActive} detecting={detecting}
            faceDetected={faceDetected} movementDetected={movementDetected} studying={studying}
            startCamera={startCamera} stopCamera={stopCamera}
            startDetection={startDetection} stopDetection={stopDetection}
            onClose={() => { stopCamera(); callbacksRef.current.onClose?.(); }}
        />
    );
};

export default FaceDetector;
