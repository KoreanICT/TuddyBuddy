import React from 'react';
import { Quiz, MainTabType } from './types';
import styles from './selfstudy.module.css';

interface Props {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  setIsModalOpen: (open: boolean) => void;
  quizList: Quiz[];
  wrongNotes: Quiz[];
  handleSelectAnswer: (quizId: number, selectedOpt: string) => void;
}

export const MainTabContent: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  setIsModalOpen,
  quizList,
  wrongNotes,
  handleSelectAnswer,
}) => {
  return (
    <main className={styles.mainContainer}>
      {/* 1. 상단 메인 탭 & 새 세션 버튼 */}
      <div className={styles.mainTabHeader}>
        <div className={styles.headerButtonGroup}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'quiz' ? styles.activeBtn : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            문제 풀이
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'wrongNotes' ? styles.activeBtn : ''}`}
            onClick={() => setActiveTab('wrongNotes')}
          >
            오답노트 {wrongNotes.length > 0 && <span className={styles.badgeCount}>{wrongNotes.length}</span>}
          </button>
        </div>

        <button 
          className={styles.createSessionBtn}
          onClick={() => setIsModalOpen(true)}
        >
          + 새 학습 세션
        </button>
      </div>

      {/* 2. 콘텐츠 카드 영역 */}
      <div className={styles.contentCard}>
        {quizList.length === 0 ? (
          <div className={styles.emptyStateCard}>
            <div className={styles.emptyIconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M12 18v-6"/>
                <path d="M9 15h6"/>
              </svg>
            </div>
            <h3>생성된 학습 자료가 없습니다</h3>
            <p>상단의 <strong>'+ 새 학습 세션'</strong> 버튼을 눌러 이미지를 업로드하고<br/>AI가 생성하는 맞춤형 퀴즈를 확인해보세요!</p>
          </div>
        ) : (
          <div className={styles.tabContent}>
            {/* 문제 풀이 탭 */}
            {activeTab === 'quiz' && (
              <div className={styles.quizList}>
                {quizList.map((quiz, idx) => (
                  <div key={quiz.quizId || idx} className={styles.quizCard}>
                    <div className={styles.quizHeader}>
                      <span className={styles.quizIndex}>Q{idx + 1}</span>
                      <h4 className={styles.quizTitle}>{quiz.quizQuestion}</h4>
                    </div>
                    
                    <ul className={styles.optionList}>
                      {quiz.quizSelections?.map((opt, optIdx) => (
                        <li 
                          key={optIdx} 
                          className={`${styles.optionItem} ${quiz.quizUserResponse === opt ? styles.selectedOption : ''}`}
                          onClick={() => handleSelectAnswer(quiz.quizId, opt)}
                        >
                          <span className={styles.optionNum}>{optIdx + 1}</span>
                          {opt}
                        </li>
                      ))}
                    </ul>

                    {quiz.quizUserResponse && (
                      <div className={`${styles.explanationBox} ${quiz.quizCorrect === 'Y' ? styles.correctBox : styles.wrongBox}`}>
                        <div className={styles.resultTitle}>
                          {quiz.quizCorrect === 'Y' ? " 정답입니다!" : " 아쉽네요, 틀렸습니다."}
                        </div>
                        <p><strong>정답 (quiz_correct_answer):</strong> {quiz.quizCorrectAnswer}</p>
                        <p><strong>해설 (quiz_explanation):</strong> {quiz.quizExplanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 오답 노트 탭 */}
            {activeTab === 'wrongNotes' && (
              <div className={styles.wrongNotesContainer}>
                {wrongNotes.length === 0 ? (
                  <div className={styles.emptyWrong}>틀린 문제가 없습니다! 모든 문제를 맞추셨어요.</div>
                ) : (
                  wrongNotes.map((item, idx) => (
                    <div key={item.quizId || idx} className={styles.quizCard}>
                      <span className={styles.wrongBadge}>오답</span>
                      <h4 className={styles.quizTitle}>Q. {item.quizQuestion}</h4>
                      <div className={styles.wrongAnswerDetail}>
                        <p className={styles.myAnswer}>내 제출 답 (quiz_user_response): {item.quizUserResponse}</p>
                        <p className={styles.correctAnswer}>정답 (quiz_correct_answer): {item.quizCorrectAnswer}</p>
                      </div>
                      <div className={styles.explanationBox}>
                        <p><strong>해설 (quiz_explanation):</strong> {item.quizExplanation}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {quizList.length > 0 && (
          <div className={styles.actionBar}>
            <button className={styles.actionBtn} onClick={() => setIsModalOpen(true)}>
              문제 다시 만들기
            </button>
            <button className={styles.actionPrimaryBtn} onClick={() => window.print()}>
              PDF 내보내기
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainTabContent;