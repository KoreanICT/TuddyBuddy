import React from 'react';
import styles from './selfstudy.module.css';

export const SelfStudyHeader: React.FC = () => {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h2>개인 스터디 (AI 학습)</h2>
        <p className={styles.subText}>AI를 활용해 교재 및 노트 이미지를 맞춤 문제로 변환해보세요.</p>
      </div>
    </header>
  );
};

export default SelfStudyHeader;