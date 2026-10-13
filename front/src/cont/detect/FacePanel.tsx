import React from 'react';
import styles from './face.module.css';

interface FacePanelProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;

    cameraActive: boolean;
    detecting: boolean;

    faceDetected: boolean;
    movementDetected: boolean;
    studying: boolean;

    startCamera: () => void;
    stopCamera: () => void;

    startDetection: () => void;
    stopDetection: () => void;

    onClose?: () => void;
}

const FacePanel: React.FC<FacePanelProps> = ({
    videoRef,
    cameraActive,
    detecting,
    faceDetected,
    movementDetected,
    studying,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection,
    onClose
}) => {

    return (
        <div className={styles.wrapper}>
            <div className={styles.panel}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <p>얼굴과 움직임 상태를 감지합니다.</p>
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
                        <div className={styles.cameraPlaceholder}>
                            카메라가 꺼져 있습니다.
                        </div>
                    )}
                </div>

                {/* 상태 */}
                <div className={styles.statusArea}>
                    <div className={styles.statusItem}>
                        <span>얼굴 감지</span>
                        <strong>
                            {!detecting
                                ? '대기'
                                : faceDetected
                                    ? '감지됨'
                                    : '감지 안됨'}
                        </strong>
                    </div>

                    <div className={styles.statusItem}>
                        <span>움직임 감지</span>
                        <strong>
                            {!detecting
                                ? '대기'
                                : movementDetected
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

                    <div className={styles.statusItem}>
                        <span>학습 상태</span>
                        <strong>
                            {!detecting
                                ? '대기'
                                : studying
                                    ? '학습 중'
                                    : '학습 중 아님'}
                        </strong>
                    </div>
                </div>

                {/* 학습 상태 안내 */}
                {detecting && !studying && (
                    <div className={styles.warning}>
                        ⚠ 학습 상태가 감지되지 않습니다.
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

            </div>
        </div>
    );
};

export default FacePanel;