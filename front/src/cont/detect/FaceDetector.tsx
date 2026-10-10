import React, { useEffect, useRef, useState } from 'react';
import FacePanel from './FacePanel';

interface FaceDetectorProps {
    onClose?: () => void;
}

interface DetectResponse {
    success: boolean;
    face_detected: boolean;
    motion_detected: boolean;
    motion_pixels: number;
    studying: boolean;
    not_studying_count: number;
    stopped: boolean;
}

const FaceDetector: React.FC<FaceDetectorProps> = ({ onClose }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraActive, setCameraActive] = useState(false);
    const [detecting, setDetecting] = useState(false);

    const [faceDetected, setFaceDetected] = useState(false);
    const [movementDetected, setMovementDetected] = useState(false);
    const [studying, setStudying] = useState(false);

    // =========================
    // 카메라 시작
    // =========================
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                try {
                    await videoRef.current.play();
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'AbortError') {
                        return;
                    }
                    console.error('비디오 재생 오류:', error);
                }
            }

            setCameraActive(true);
        } catch (error) {
            console.error('카메라 실행 오류:', error);
            alert('카메라를 사용할 수 없습니다.');
        }
    };

    // =========================
    // 카메라 종료
    // =========================
    const stopCamera = () => {
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        streamRef.current = null;

        setCameraActive(false);
        setDetecting(false);
        setFaceDetected(false);
        setMovementDetected(false);
        setStudying(false);
    };

    // =========================
    // 감지 시작
    // =========================
    const startDetection = () => {
        if (!cameraActive) {
            alert('먼저 카메라를 실행해주세요.');
            return;
        }

        setDetecting(true);
    };

    // =========================
    // 감지 중지
    // =========================
    const stopDetection = () => {
        setDetecting(false);
        setFaceDetected(false);
        setMovementDetected(false);
        setStudying(false);
    };

    // =========================
    // FastAPI 감지 요청
    // =========================
    useEffect(() => {
        if (!detecting) {
            return;
        }

        const detect = async () => {
            const video = videoRef.current;

            if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
                return;
            }

            const canvas = document.createElement('canvas');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');

            if (!context) {
                return;
            }

            // 현재 video 화면을 canvas에 그림
            context.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height
            );

            // canvas → Blob
            canvas.toBlob(async blob => {
                if (!blob) {
                    return;
                }

                const formData = new FormData();
                formData.append('file', blob, 'frame.jpg');

                try {
                    const response = await fetch(
                        'http://192.168.0.84:8000/ai/detect/focus',
                        {
                            method: 'POST',
                            body: formData
                        }
                    );

                    const data: DetectResponse = await response.json();

                    if (!data.success) {
                        return;
                    }

                    setFaceDetected(data.face_detected);
                    setMovementDetected(data.motion_detected);
                    setStudying(data.studying);

                    if (data.stopped) {
                        setDetecting(false);
                    }

                } catch (error) {
                    console.error('학습 집중 감지 오류:', error);
                }
            }, 'image/jpeg');
        };

        const timer = window.setInterval(detect, 1000);

        return () => {
            window.clearInterval(timer);
        };

    }, [detecting]);

    // =========================
    // 컴포넌트 종료 시 카메라 정리
    // =========================
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <FacePanel
            videoRef={videoRef}
            cameraActive={cameraActive}
            detecting={detecting}
            faceDetected={faceDetected}
            movementDetected={movementDetected}
            studying={studying}
            startCamera={startCamera}
            stopCamera={stopCamera}
            startDetection={startDetection}
            stopDetection={stopDetection}
            onClose={onClose}
        />
    );
};

export default FaceDetector;