import React, { useRef, useState } from 'react';
import styles from './layout.module.css';

import Navbar from './Navbar';
import FloatingButton from './floatingButton/FloatingButton';
import FaceDetector from '../cont/detect/FaceDetector';

interface LayoutProps {
  children: React.ReactNode;
}

interface Position {
  x: number;
  y: number;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  const [showFaceDetector, setShowFaceDetector] = useState(false);

  // FaceDetector 위치
  const [position, setPosition] = useState<Position>({
    x: 20,
    y: 100
  });

  const dragOffset = useRef<Position>({
    x: 0,
    y: 0
  });

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {

    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };


  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {

    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return;
    }

    const modalWidth = 360;
    const modalHeight = 300;

    let x = e.clientX - dragOffset.current.x;
    let y = e.clientY - dragOffset.current.y;

    // 화면 밖으로 못 나가게 제한
    x = Math.max(
      0,
      Math.min(x, window.innerWidth - modalWidth)
    );

    y = Math.max(
      0,
      Math.min(y, window.innerHeight - modalHeight)
    );

    setPosition({
      x,
      y
    });
  };


  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {

    e.currentTarget.releasePointerCapture(e.pointerId);
  };


  return (
    <div className={styles.layout}>

      <header className={styles.header}>
        <div className="container">
          <Navbar />
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <FloatingButton />


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


      {/* FaceDetector */}
      {showFaceDetector && (

        <div
          className={styles.focusModal}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`
          }}
        >

          {/* 드래그 영역 */}
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

    </div>
  );
};

export default Layout;