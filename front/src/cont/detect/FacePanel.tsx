import React from 'react';
import styles from './face.module.css';

interface FacePanelProps {

    videoRef:
        React.RefObject<HTMLVideoElement | null>;

    cameraActive: boolean;
    detecting: boolean;

    faceDetected: boolean;
    movementDetected: boolean;

    drowsy: boolean;

    startCamera: () => void;
    stopCamera: () => void;

    startDetection: () => void;
    stopDetection: () => void;

    onClose?: () => void;

    setFaceDetected:
        React.Dispatch<
            React.SetStateAction<boolean>
        >;

    setMovementDetected:
        React.Dispatch<
            React.SetStateAction<boolean>
        >;
}

const FacePanel:
    React.FC<FacePanelProps> = ({

        videoRef,

        cameraActive,
        detecting,

        faceDetected,
        movementDetected,

        drowsy,

        startCamera,
        stopCamera,

        startDetection,
        stopDetection,

        onClose,

        setFaceDetected,
        setMovementDetected

    }) => {

    return (
        <div className={styles.wrapper}>

            <div className={styles.panel}>

                {/* Header */}
                <div className={styles.header}>

                    <div>
                        <h2>
                            학습 집중 감지
                        </h2>

                        <p>
                            얼굴과 움직임 상태를 감지합니다.
                        </p>
                    </div>

                    {onClose && (
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                        >
                            ×
                        </button>
                    )}

                </div>


                {/* Webcam */}
                <div className={styles.cameraArea}>

                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        data-keepplaying
                        className={styles.video}
                    />

                    {!cameraActive && (
                        <div
                            className={
                                styles.cameraPlaceholder
                            }
                        >
                            카메라가 꺼져 있습니다.
                        </div>
                    )}

                </div>


                {/* 상태 */}
                <div className={styles.statusArea}>

                    <div className={styles.statusItem}>
                        <span>얼굴 감지</span>

                        <strong>
                            {faceDetected
                                ? '감지됨'
                                : '감지 안됨'}
                        </strong>
                    </div>

                    <div className={styles.statusItem}>
                        <span>움직임 감지</span>

                        <strong>
                            {movementDetected
                                ? '감지됨'
                                : '감지 안됨'}
                        </strong>
                    </div>

                    <div className={styles.statusItem}>
                        <span>감지 상태</span>

                        <strong>
                            {detecting
                                ? '감지 중'
                                : '대기'}
                        </strong>
                    </div>

                </div>


                {/* 졸음 경고 */}
                {drowsy && (
                    <div className={styles.warning}>
                        ⚠ 졸음이 의심됩니다.
                    </div>
                )}


                {/* 버튼 */}
                <div className={styles.actions}>

                    {!cameraActive ? (
                        <button onClick={startCamera}>
                            카메라 시작
                        </button>
                    ) : (
                        <button onClick={stopCamera}>
                            카메라 종료
                        </button>
                    )}

                    {!detecting ? (
                        <button onClick={startDetection}>
                            감지 시작
                        </button>
                    ) : (
                        <button onClick={stopDetection}>
                            감지 중지
                        </button>
                    )}

                </div>


                {/* 개발용 임시 */}
                <div className={styles.testArea}>

                    <p>개발용 감지 테스트</p>

                    <button
                        onClick={() =>
                            setFaceDetected(
                                prev => !prev
                            )
                        }
                    >
                        얼굴 상태 변경
                    </button>

                    <button
                        onClick={() =>
                            setMovementDetected(
                                prev => !prev
                            )
                        }
                    >
                        움직임 상태 변경
                    </button>

                </div>

            </div>

        </div>
    );
};

export default FacePanel;