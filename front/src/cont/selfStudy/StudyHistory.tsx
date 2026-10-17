
import React, { useId, useState } from 'react';
import { QuizSession, SelfStudyResult } from './types';
import styles from './selfstudy.module.css';
import timerStyles from '../timer/timer.module.css';

interface Props {
  savedSessions: QuizSession[];
  savedResults: SelfStudyResult[];
  currentSessionId: number | null;
  historyLoading: boolean;
  restoring: boolean;
  deleting: boolean;
  historyError: string;
  onRefreshHistory: () => void | Promise<void>;
  onRestoreSession: (sessionId: number) => void | Promise<void>;
  onDeleteSession: (sessionId: number) => void | Promise<void>;
}

export const StudyHistory: React.FC<Props> = ({
  savedSessions,
  savedResults,
  currentSessionId,
  historyLoading,
  restoring,
  deleting,
  historyError,
  onRefreshHistory,
  onRestoreSession,
  onDeleteSession,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentId = useId();

  const busy = restoring || deleting;

  const getSessionResult = (
    sessionId: number
  ): SelfStudyResult | undefined => {
    return savedResults
      .filter((result) => result.quizSessionId === sessionId)
      .sort(
        (a, b) =>
          b.selfstudyResultsId - a.selfstudyResultsId
      )[0];
  };

  const formatDate = (value?: string | null): string => {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section
        className={`${styles.contentCard} ${styles.historyCard} ${
        !isExpanded ? styles.historyCardCollapsed : ''
     }`}
>
      {/* 제목 및 접기·펼치기 */}
     <div className={styles.historyHeader}>
  <h3 className={styles.historyTitle}>
    내 학습 기록
    <span className={styles.historyCount}>
      {savedSessions.length}
    </span>
  </h3>

  <button
    type="button"
    className={styles.historyToggleBtn}
    onClick={() => setIsExpanded((prev) => !prev)}
    aria-expanded={isExpanded}
    aria-controls={contentId}
  >
    {isExpanded ? '접기' : '펼치기'}
    <span aria-hidden="true">
      {isExpanded ? '⌃' : '⌄'}
    </span>
  </button>
</div>
      {isExpanded && (
        <div id={contentId}>
          <p className={styles.historyDescription}>
            저장된 학습 세션을 불러와 이전 문제와
            답안을 다시 확인할 수 있습니다.
          </p>

          {historyError && (
            <p className={styles.historyError} role="alert">
              {historyError}
            </p>
          )}

          <div className={styles.historyList}>
            {historyLoading && savedSessions.length === 0 ? (
              <p className={styles.historyEmpty}>
                학습 기록을 불러오는 중입니다...
              </p>
            ) : savedSessions.length === 0 ? (
              <p className={styles.historyEmpty}>
                저장된 학습 기록이 없습니다.
                <br />
                새 학습 세션을 만들어 보세요.
              </p>
            ) : (
              <div className={styles.historyItems}>
                {savedSessions.map((session) => {
                  const sessionId = session.quizSessionId;
                  if (!sessionId) return null;

                  const result = getSessionResult(sessionId);
                  const selected = currentSessionId === sessionId;

                  return (
                    <div
                      key={sessionId}
                      className={`${styles.historyItem} ${
                        selected ? styles.historyItemSelected : ''
                      }`}
                    >
                      <div className={styles.historyItemHeader}>
                        <strong className={styles.historyItemTitle}>
                          학습 세션 #{sessionId}
                        </strong>

                        {selected && (
                          <span className={styles.historySelected}>
                            선택 중
                          </span>
                        )}
                      </div>

                      <div className={styles.historyItemDetails}>
                        <span>
                          생성일: {formatDate(session.createdAt)}
                        </span>
                        <span>
                          문제 수: {session.quizCount ?? 0}문제
                        </span>

                        {result ? (
                          <>
                            <span>
                              점수: {result.selfstudyTotalScore}점
                            </span>
                            <span>
                              제출일: {formatDate(result.submittedAt)}
                            </span>
                          </>
                        ) : (
                          <span className={styles.historyPending}>
                            미제출
                          </span>
                        )}
                      </div>

                      <div className={styles.historyActions}>
                        <button
                          type="button"
                          className={`${styles.actionPrimaryBtn} ${styles.historyRestoreBtn}`}
                          disabled={busy || historyLoading}
                          onClick={() => void onRestoreSession(sessionId)}
                        >
                          {restoring ? '불러오는 중...' : '불러오기'}
                        </button>

                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.historyDeleteBtn}`}
                          disabled={busy || historyLoading}
                          onClick={() => void onDeleteSession(sessionId)}
                        >
                          {deleting ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default StudyHistory;
