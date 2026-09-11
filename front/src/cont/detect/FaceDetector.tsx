import React, { useEffect, useRef, useState } from 'react';

import FacePanel from './FacePanel';

interface FaceDetectorProps {
    onClose?: () => void;
}

const FaceDetector: React.FC<
    FaceDetectorProps
> = ({
    onClose
}) => {

        const videoRef = useRef<HTMLVideoElement | null>(null);
        const streamRef = useRef<MediaStream | null>(null);

        // 카메라 실행 여부
        const [cameraActive, setCameraActive] = useState(false);

        // 감지 실행 여부
        const [detecting, setDetecting] = useState(false);

        // 얼굴 감지 여부
        const [faceDetected, setFaceDetected] = useState(true);

        // 움직임 감지 여부
        const [movementDetected, setMovementDetected] = useState(true);

        // 졸음 의심 여부
        const [drowsy, setDrowsy] = useState(false);

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
                        // 라우팅 / 컴포넌트 제거 과정에서
                        // play가 중단되는 경우는 무시
                        if (error instanceof DOMException) {
                            if (
                                error.name === 'AbortError'
                            ) {
                                return;
                            }
                        }
                        console.error(
                            '비디오 재생 오류:',
                            error
                        );
                    }
                }
                setCameraActive(true);

            } catch (error) {
                console.error(
                    '카메라 실행 오류:',
                    error
                );

                alert(
                    '카메라를 사용할 수 없습니다.'
                );
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
                streamRef.current
                    .getTracks()
                    .forEach(track =>
                        track.stop()
                    );
            }

            streamRef.current = null;

            setCameraActive(false);
            setDetecting(false);
            setDrowsy(false);
        };

        // =========================
        // 감지 시작
        // =========================

        const startDetection = () => {
            if (!cameraActive) {
                alert(
                    '먼저 카메라를 실행해주세요.'
                );
                return;
            }
            setDetecting(true);
        };

        // 감지 중지

        const stopDetection = () => {
            setDetecting(false);
            setDrowsy(false);
        };

        // 임시 졸음 판단
        // 나중에 OpenCV 결과로 교체

        useEffect(() => {
            if (!detecting) {
                return;
            }

            const timer = window.setInterval(() => {
                const isDrowsy =
                    !faceDetected &&
                    !movementDetected;
                setDrowsy(isDrowsy);
            }, 1000);
            return () => {
                window.clearInterval(timer);
            };

        }, [detecting, faceDetected, movementDetected]);

        // 종료 시
        // 카메라 정리
        useEffect(() => {
            return () => {
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
                if (streamRef.current) {
                    streamRef.current
                        .getTracks()
                        .forEach(track =>
                            track.stop()
                        );
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
                drowsy={drowsy}
                startCamera={startCamera}
                stopCamera={stopCamera}
                startDetection={startDetection}
                stopDetection={stopDetection}
                onClose={onClose}
                setFaceDetected={setFaceDetected}
                setMovementDetected={setMovementDetected}
            />
        );
    };

export default FaceDetector;