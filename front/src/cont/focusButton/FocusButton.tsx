import React, { useRef, useState } from 'react';
import FaceDetector from '../../cont/detect/FaceDetector';
import styles from './focusButton.module.css';

interface Position {
    x: number;
    y: number;
}

const FocusButton: React.FC = () => {

    const [showFaceDetector, setShowFaceDetector] = useState(false);

    const [position, setPosition] = useState<Position>({
        x: 20,
        y: 100
    });

    const dragOffset = useRef<Position>({
        x: 0,
        y: 0
    });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
            return;
        }

        const modalWidth = 360;
        const modalHeight = 300;

        let x = e.clientX - dragOffset.current.x;
        let y = e.clientY - dragOffset.current.y;

        x = Math.max(0, Math.min(x, window.innerWidth - modalWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - modalHeight));

        setPosition({ x, y });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <>
            {/* 학습 집중 버튼 */}
            {!showFaceDetector && (
                <button
                    type="button"
                    className={styles.focusButton}
                    onClick={() => setShowFaceDetector(true)}
                >
                    학습 집중
                </button>
            )}

            {/* 학습 집중 감지 박스 */}
            {showFaceDetector && (
                <div
                    className={styles.focusModal}
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`
                    }}
                >
                    <div
                        className={styles.dragHandle}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                    >
                        학습 집중 감지
                        <span>⋮⋮</span>
                    </div>

                    <FaceDetector
                        onClose={() => setShowFaceDetector(false)}
                    />
                </div>
            )}
        </>
    );
};

export default FocusButton;