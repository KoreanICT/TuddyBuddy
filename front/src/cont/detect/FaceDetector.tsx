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
    onDetectionError?: (message: string) => void;
    autoStart?: boolean;
}

const DETECT_API = 'http://192.168.0.84:8000/ai/detect';

const FaceDetector: React.FC<FaceDetectorProps> = ({
    onClose, onDetectionResult, onDetectionEnd, onDetectionError, autoStart = false
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef(false);
    const cameraVersionRef = useRef(0);
    const startingCameraRef = useRef(false);
    const cancelDetectionRef = useRef<(() => void) | null>(null);
    const callbacksRef = useRef({ onClose, onDetectionResult, onDetectionEnd, onDetectionError });
    callbacksRef.current = { onClose, onDetectionResult, onDetectionEnd, onDetectionError };
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
        if (startingCameraRef.current || streamRef.current) return false;
        startingCameraRef.current = true;
        const version = ++cameraVersionRef.current;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (!mountedRef.current || version !== cameraVersionRef.current) {
                stream.getTracks().forEach(track => track.stop());
                return false;
            }
            streamRef.current = stream;
            stream.getVideoTracks().forEach(track => {
                track.onended = () => {
                    if (streamRef.current !== stream || !mountedRef.current) return;
                    stopCamera();
                    callbacksRef.current.onDetectionError?.('카메라 연결이 종료되어 학습을 일시정지했습니다.');
                };
            });
            const video = videoRef.current;
            if (!video) throw new Error('카메라 화면이 없습니다.');
            video.srcObject = stream;
            await video.play();
            if (mountedRef.current && version === cameraVersionRef.current) {
                setCameraActive(true);
                return true;
            }
            return false;
        } catch (error) {
            if (!mountedRef.current || version !== cameraVersionRef.current) return false;
            stopCamera();
            if (callbacksRef.current.onDetectionError) {
                callbacksRef.current.onDetectionError('카메라를 사용할 수 없습니다. 카메라 권한을 확인해주세요.');
            } else alert('카메라를 사용할 수 없습니다.');
            return false;
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
        let lastResponseAt = Date.now();
        let watchdog: number | undefined;
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
            window.clearInterval(watchdog);
            controller.abort();
            if (sessionId) deleteSession(sessionId);
            callbacksRef.current.onDetectionEnd?.();
        };
        cancelDetectionRef.current = cancel;

        const fail = () => {
            if (!active) return;
            stopCamera();
            const message = '학습 집중 서버의 응답을 확인할 수 없습니다. 연결 상태를 확인하고 다시 시작해주세요.';
            if (callbacksRef.current.onDetectionError) callbacksRef.current.onDetectionError(message);
            else alert(message);
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
                    if (!data.success || typeof data.studying !== 'boolean'
                        || typeof data.stopped !== 'boolean'
                        || typeof data.face_detected !== 'boolean'
                        || typeof data.motion_detected !== 'boolean'
                        || !Number.isFinite(data.not_studying_seconds)
                        || data.not_studying_seconds < 0) throw new Error('감지 실패');
                    lastResponseAt = Date.now();
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
        // 통신 지연·카메라 프레임 중단 중에도 타이머가 무한히 실행되지 않도록 합니다.
        watchdog = window.setInterval(() => {
            if (Date.now() - lastResponseAt >= 15000) fail();
        }, 1000);
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
            startingCameraRef.current = false;
            cancelDetectionRef.current?.();
            streamRef.current?.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!autoStart) return;
        let active = true;
        void startCamera().then(started => {
            if (active && started) setDetecting(true);
        });
        return () => { active = false; };
        // 자동 시작은 통합 학습 패널이 컴포넌트를 열 때 한 번 수행합니다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart]);

    return (
        <FacePanel
            videoRef={videoRef} cameraActive={cameraActive} detecting={detecting}
            faceDetected={faceDetected} movementDetected={movementDetected} studying={studying}
            startCamera={startCamera} stopCamera={stopCamera}
            startDetection={startDetection} stopDetection={stopDetection}
            managed={autoStart}
            onClose={onClose ? () => { stopCamera(); callbacksRef.current.onClose?.(); } : undefined}
        />
    );
};

export default FaceDetector;
