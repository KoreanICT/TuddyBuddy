import React, { useState } from 'react';
import styles from './layout.module.css';

import Navbar from './Navbar';
import FloatingButton from './floatingButton/FloatingButton';
import FaceDetector from '../cont/detect/FaceDetector';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  const [showFaceDetector, setShowFaceDetector] = useState(false);

  return (
    <>
      <div className={styles.layout}>

        <header className={styles.header}>
          <div className="container">
            <Navbar />
          </div>
        </header>

        <main className={styles.main}>
          {children}
        </main>

        {/* 기존 플로팅 버튼 */}
        <FloatingButton />

        {/* 좌상단 학습 집중 버튼 */}
        {!showFaceDetector && (
          <button
            type="button"
            className={styles.focusButton}
            onClick={() => setShowFaceDetector(true)}
          >
            학습 집중
          </button>
        )}

        {/* 좌상단 집중 감지 모달 */}
        {showFaceDetector && (
          <div className={styles.focusModal}>
            <FaceDetector
              onClose={() => setShowFaceDetector(false)}
            />
          </div>
        )}

      </div>
    </>
  );
};

export default Layout;