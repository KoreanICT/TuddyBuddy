// 최솔
import React from 'react';
import {
  Quiz,
  QuizSession,
  SelfStudyResult,
  MainTabType,
} from './types';

import styles from './selfstudy.module.css';
import FocusButton from '../focusButton/FocusButton';

interface Props {
  onSubmit: () => void;
  submitting: boolean;
  submitted: boolean;
  score: number | null;

  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  setIsModalOpen: (open: boolean) => void;

  quizList: Quiz[];
  wrongNotes: Quiz[];

  handleSelectAnswer: (
    quizId: number,
    selectedOpt: string
  ) => void;

  previewUrl: string | null;

  // 저장된 학습 기록
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

const formatDate = (value?: string): string => {
  if (!value) return '날짜 정보 없음';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ko-KR');
};

const getQuizTypeName = (type: string): string => {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return '객관식';
    case 'SHORT_ANSWER':
      return '단답형';
    case 'OX':
      return 'OX';
    default:
      return type;
  }
};

export const MainTabContent: React.FC<Props> = ({
  onSubmit,
  submitting,
  submitted,
  score,

  activeTab,
  setActiveTab,
  setIsModalOpen,

  quizList,
  wrongNotes,
  handleSelectAnswer,
  previewUrl,

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
  const busy =
    submitting ||
    restoring ||
    deleting;

  const getSessionResult = (
    sessionId: number
  ): SelfStudyResult | undefined => {
    return savedResults
      .filter(
        (result) => result.quizSessionId === sessionId
      )
      .sort(
        (a, b) =>
          b.selfstudyResultsId - a.selfstudyResultsId
      )[0];
  };

  return (
    <main className={styles.mainContainer}>

      {/* =====================================================
          1. 상단 메인 탭 & 새 세션 버튼
         ===================================================== */}

      <div className={styles.mainTabHeader}>
        <div className={styles.headerButtonGroup}>
          <button
            className={`${styles.navBtn} ${
              activeTab === 'quiz'
                ? styles.activeBtn
                : ''
            }`}
            onClick={() => setActiveTab('quiz')}
          >
            문제 풀이
          </button>

          <button
            className={`${styles.navBtn} ${
              activeTab === 'wrongNotes'
                ? styles.activeBtn
                : ''
            }`}
            onClick={() => setActiveTab('wrongNotes')}
          >
            오답노트

            {wrongNotes.length > 0 && (
              <span className={styles.badgeCount}>
                {wrongNotes.length}
              </span>
            )}
          </button>

          <FocusButton />
        </div>

        <button
          className={styles.createSessionBtn}
          onClick={() => setIsModalOpen(true)}
        >
          + 새 학습 세션
        </button>
      </div>

      {/* =====================================================
          2. 내 학습 기록
          기존 CSS를 유지하기 위해 contentCard 사용
         ===================================================== */}

      <div
        className={styles.contentCard}
        style={{
          marginBottom: '20px',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              내 학습 기록
            </h3>

            <p
              style={{
                margin: '6px 0 0',
                fontSize: '13px',
                color: '#64748b',
              }}
            >
              저장된 학습 세션을 선택하면
              이전 문제와 답안을 다시 볼 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            className={styles.actionBtn}
            disabled={historyLoading || busy}
            onClick={() => {
              void onRefreshHistory();
            }}
          >
            {historyLoading
              ? '조회 중...'
              : '새로고침'}
          </button>
        </div>

        {historyError && (
          <p
            role="alert"
            style={{
              color: '#dc2626',
              fontSize: '13px',
            }}
          >
            {historyError}
          </p>
        )}

        {historyLoading && savedSessions.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              padding: '24px',
              color: '#64748b',
            }}
          >
            학습 기록을 불러오는 중입니다...
          </p>
        ) : savedSessions.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              padding: '24px',
              color: '#64748b',
            }}
          >
            저장된 학습 기록이 없습니다.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            {savedSessions.map((session) => {
              const sessionId = session.quizSessionId;

              if (!sessionId) return null;

              const result = getSessionResult(sessionId);

              const selected =
                currentSessionId === sessionId;

              return (
                <div
                  key={sessionId}
                  style={{
                    border: selected
                      ? '1px solid #2563eb'
                      : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px',
                    backgroundColor: selected
                      ? '#eff6ff'
                      : '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <strong
                      style={{
                        fontSize: '14px',
                      }}
                    >
                      학습 #{sessionId}

                      {selected && (
                        <span
                          style={{
                            marginLeft: '8px',
                            color: '#2563eb',
                            fontSize: '12px',
                          }}
                        >
                          현재 선택
                        </span>
                      )}
                    </strong>

                    <span
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                      }}
                    >
                      {formatDate(session.createdAt)}
                    </span>

                    <span
                      style={{
                        fontSize: '12px',
                        color: '#475569',
                      }}
                    >
                      {getQuizTypeName(session.quizType)}
                      {' · '}
                      {session.quizCount}문제
                      {' · '}
                      {session.quizDifficulty}
                    </span>

                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: result
                          ? '#2563eb'
                          : '#64748b',
                      }}
                    >
                      {result
                        ? `저장된 점수: ${result.selfstudyTotalScore}점`
                        : '미제출'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      type="button"
                      className={styles.actionPrimaryBtn}
                      disabled={busy || loadingDisabled(historyLoading)}
                      onClick={() => {
                        void onRestoreSession(sessionId);
                      }}
                    >
                      {restoring
                        ? '불러오는 중...'
                        : '불러오기'}
                    </button>

                    <button
                      type="button"
                      className={styles.actionBtn}
                      disabled={busy || historyLoading}
                      onClick={() => {
                        void onDeleteSession(sessionId);
                      }}
                      style={{
                        color: '#dc2626',
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================
          3. 기존 문제 풀이 / 오답노트
         ===================================================== */}

      <div className={styles.contentCard}>
        {quizList.length === 0 ? (
          <div className={styles.emptyStateCard}>
            <div className={styles.emptyIconWrapper}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M12 18v-6" />
                <path d="M9 15h6" />
              </svg>
            </div>

            <h3>생성된 학습 자료가 없습니다</h3>

            <p>
              상단의 <strong>'+ 새 학습 세션'</strong> 버튼을
              눌러 이미지를 업로드하거나
              <br />
              내 학습 기록에서 이전 학습을 불러와 보세요!
            </p>
          </div>
        ) : (
          <div className={styles.tabContent}>

            {/* 문제 풀이 탭 */}
            {activeTab === 'quiz' && (
              <div className={styles.quizList}>

                {/* 원본 이미지 */}
                {previewUrl && (
                  <div className={styles.quizCard}>
                    <div className={styles.quizHeader}>
                      <h4 className={styles.quizTitle}>
                        원본 학습 자료
                      </h4>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '16px 0',
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt="업로드한 원본 학습 자료"
                        style={{
                          display: 'block',
                          maxWidth: '100%',
                          maxHeight: '600px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '8px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 생성된 AI 문제 */}
                {quizList.map((quiz, idx) => (
                  <div
                    key={quiz.quizId || idx}
                    className={styles.quizCard}
                  >
                    <div className={styles.quizHeader}>
                      <span className={styles.quizIndex}>
                        Q{idx + 1}
                      </span>

                      <h4 className={styles.quizTitle}>
                        {quiz.quizQuestion}
                      </h4>
                    </div>

                    {/* 단답형 문제 */}
                    {quiz.quizSelections.length === 0 && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();

                          if (submitted || busy) return;

                          const answer = new FormData(
                            e.currentTarget
                          ).get('answer');

                          if (
                            typeof answer === 'string' &&
                            answer.trim()
                          ) {
                            handleSelectAnswer(
                              quiz.quizId,
                              answer.trim()
                            );
                          }
                        }}
                      >
                        <input
                          key={`${quiz.quizId}-${quiz.quizUserResponse ?? ''}`}
                          name="answer"
                          aria-label="단답형 답안"
                          defaultValue={
                            quiz.quizUserResponse ?? ''
                          }
                          disabled={submitted || busy}
                          required
                          maxLength={1000}
                        />

                        <button
                          type="submit"
                          disabled={submitted || busy}
                        >
                          답 확인
                        </button>
                      </form>
                    )}

                    {/* 객관식 / OX 선택지 */}
                    <ul className={styles.optionList}>
                      {quiz.quizSelections.map(
                        (opt, optIdx) => (
                          <li
                            key={optIdx}
                            className={`${
                              styles.optionItem
                            } ${
                              quiz.quizUserResponse === opt
                                ? styles.selectedOption
                                : ''
                            }`}
                            onClick={() => {
                              if (!submitted && !busy) {
                                handleSelectAnswer(
                                  quiz.quizId,
                                  opt
                                );
                              }
                            }}
                            style={{
                              cursor:
                                submitted || busy
                                  ? 'default'
                                  : 'pointer',
                            }}
                          >
                            <span className={styles.optionNum}>
                              {optIdx + 1}
                            </span>

                            {opt}
                          </li>
                        )
                      )}
                    </ul>

                    {/* 정답 및 해설 */}
                    {quiz.quizUserResponse && (
                      <div
                        className={`${
                          styles.explanationBox
                        } ${
                          quiz.quizCorrect === 'Y'
                            ? styles.correctBox
                            : styles.wrongBox
                        }`}
                      >
                        <div className={styles.resultTitle}>
                          {quiz.quizCorrect === 'Y'
                            ? '정답입니다!'
                            : '아쉽네요, 틀렸습니다.'}
                        </div>

                        <p>
                          <strong>
                            정답 (quiz_correct_answer):
                          </strong>{' '}
                          {quiz.quizCorrectAnswer}
                        </p>

                        <p>
                          <strong>
                            해설 (quiz_explanation):
                          </strong>{' '}
                          {quiz.quizExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 오답노트 탭 */}
            {activeTab === 'wrongNotes' && (
              <div className={styles.wrongNotesContainer}>
                {wrongNotes.length === 0 ? (
                  <div className={styles.emptyWrong}>
                    틀린 문제가 없습니다! 모든 문제를 맞추셨어요.
                  </div>
                ) : (
                  wrongNotes.map((item, idx) => (
                    <div
                      key={item.quizId || idx}
                      className={styles.quizCard}
                    >
                      <span className={styles.wrongBadge}>
                        오답
                      </span>

                      <h4 className={styles.quizTitle}>
                        Q. {item.quizQuestion}
                      </h4>

                      <div className={styles.wrongAnswerDetail}>
                        <p className={styles.myAnswer}>
                          내 제출 답 (quiz_user_response):{' '}
                          {item.quizUserResponse}
                        </p>

                        <p className={styles.correctAnswer}>
                          정답 (quiz_correct_answer):{' '}
                          {item.quizCorrectAnswer}
                        </p>
                      </div>

                      <div className={styles.explanationBox}>
                        <p>
                          <strong>
                            해설 (quiz_explanation):
                          </strong>{' '}
                          {item.quizExplanation}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            4. 기존 제출 / PDF 내보내기
           ================================================= */}

        {quizList.length > 0 && (
          <div className={styles.actionBar}>
            {score !== null && (
              <strong>
                저장된 점수: {score}점
              </strong>
            )}

            <button
              className={styles.actionPrimaryBtn}
              disabled={submitting || submitted || restoring}
              onClick={onSubmit}
            >
              {submitted
                ? '답안 저장 완료'
                : submitting
                  ? '저장 중...'
                  : '답안 제출 및 저장'}
            </button>

            <button
              className={styles.actionBtn}
              onClick={() => setIsModalOpen(true)}
            >
              문제 다시 만들기
            </button>

            <button
              className={styles.actionPrimaryBtn}
              onClick={() => window.print()}
            >
              PDF 내보내기
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

// 로딩 중인 기록을 중복 조회하지 않도록 처리
function loadingDisabled(loading: boolean): boolean {
  return loading;
}

export default MainTabContent;