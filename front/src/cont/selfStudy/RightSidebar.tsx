// 최솔 - 타이머와 내 학습 기록만 배치
import React from 'react';
import FocusStudyPanel from './FocusStudyPanel';
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
  onRestoreSession: (sessionId: number) => Promise<void>;
  onDeleteSession: (sessionId: number) => Promise<void>;
}

export const RightSidebar: React.FC<Props> = (props) => (
  <aside className={styles.rightSidebar}>
    <div className={styles.sidebarHeaderSpacer} aria-hidden="true" />

    <FocusStudyPanel />

    <StudyHistory {...props} />
  </aside>
);

export default RightSidebar;
