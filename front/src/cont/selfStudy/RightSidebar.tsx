// 최솔 - 타이머와 내 학습 기록만 배치
import React from 'react';
import Timer from '../timer/Timer';
import StudyHistory from './StudyHistory';
import { QuizSession, SelfStudyResult } from './types';
import styles from './selfstudy.module.css';

interface Props {
  savedSessions: QuizSession[];
  savedResults: SelfStudyResult[];
  currentSessionId: number | null;
  historyLoading: boolean;
  restoring: boolean;
  deleting: boolean;
  historyError: string;
  onRefreshHistory: () => Promise<void>;
  onRestoreSession: (sessionId: number) => Promise<void>;
  onDeleteSession: (sessionId: number) => Promise<void>;
}

export const RightSidebar: React.FC<Props> = (props) => (
  <aside className={styles.rightSidebar}>
    <div className={styles.sidebarHeaderSpacer} aria-hidden="true" />

    <div className={styles.topPanel}>
      <Timer />
    </div>

    <StudyHistory {...props} />
  </aside>
);

export default RightSidebar;
