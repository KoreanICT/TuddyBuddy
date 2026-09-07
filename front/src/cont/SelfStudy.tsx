import React, { useState, useRef } from 'react';
import styles from './selfstudy.module.css';

interface QuizItem {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

interface SummaryData {
  summary: string;
  keywords: string[];
}

const SelfStudy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'summary' | 'wrongNotes'>('quiz');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quizType, setQuizType] = useState<string>('multiple');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [userPrompt, setUserPrompt] = useState<string>('');

  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [wrongNotes, setWrongNotes] = useState<QuizItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUserPrompt('');
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      alert("이미지를 선택해주세요.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("quizType", quizType);
    formData.append("difficulty", difficulty);
    formData.append("questionCount", String(questionCount));
    formData.append("prompt", userPrompt);

    try {
      const response = await fetch("http://192.198.0.19:3000/generate-quiz", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("서버 응답 오류");

      const data = await response.json();
      const parsedData = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;

      if (parsedData.quizzes) setQuizList(parsedData.quizzes);
      if (parsedData.summary) setSummaryData(parsedData.summary);

      handleCloseModal();
      setActiveTab('quiz');
    } catch (error) {
      console.error("문제 생성 중 오류:", error);
      alert("문제를 생성하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (quizId: number, selectedOpt: string) => {
    setQuizList((prevList) =>
      prevList.map((q) => {
        if (q.id === quizId) {
          const isCorrect = q.answer === selectedOpt;
          const updated = { ...q, userAnswer: selectedOpt, isCorrect };

          if (!isCorrect) {
            setWrongNotes((prevWrong) => {
              if (!prevWrong.some((item) => item.id === q.id)) {
                return [...prevWrong, updated];
              }
              return prevWrong;
            });
          }
          return updated;
        }
        return q;
      })
    );
  };

  return (
    <div className="container">
      {/* 헤더 우측 상단 버튼 그룹 */}
      <header className={styles.pageHeader}>
        <div>
          <h2>개인 스터디 (AI 학습)</h2>
          <p className={styles.subText}>AI를 활용해 교재 및 노트 이미지를 맞춤 문제로 변환해보세요.</p>
        </div>

        {/* 심플한 우측 버튼 배치 */}
        <div className={styles.headerButtonGroup}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'quiz' ? styles.activeBtn : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            문제 풀이
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'summary' ? styles.activeBtn : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            요약 노트
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'wrongNotes' ? styles.activeBtn : ''}`}
            onClick={() => setActiveTab('wrongNotes')}
          >
            오답노트 {wrongNotes.length > 0 && <span className={styles.badgeCount}>{wrongNotes.length}</span>}
          </button>
        </div>
      </header>

      <div className={styles.contentArea}>
        {/* 새 학습 세션 버튼 (기존 유지) */}
        <aside className={styles.sidebar}>
          <div className={styles.createCardWrapper}>
            <button 
              className={styles.createCard}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className={styles.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span className={styles.createText}>새 학습 세션</span>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.menuItem}>
                  <span></span> PDF·문서 업로드
                </button>
                <button className={styles.menuItem}>
                  <span></span> 강의 녹음 <span className={styles.badge}>NEW</span>
                </button>
                <button className={styles.menuItem}>
                  <span></span> YouTube 영상
                </button>
                <button 
                  className={styles.menuItem}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsModalOpen(true);
                  }}
                >
                  <span></span> 이미지 업로드
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* 메인 영역 */}
        <main className={styles.mainContainer}>
          {/* 학습 자료 미생성 시 박스 (기존 유지) */}
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
              <p>왼쪽의 <strong>'+ 새 학습 세션'</strong> 버튼을 눌러 이미지를 업로드하고<br/>AI가 생성하는 맞춤형 퀴즈와 요약을 확인해보세요!</p>
            </div>
          ) : (
            /* 문제 생성 완료 후 탭별 콘텐츠 */
            <div className={styles.tabContent}>
              {activeTab === 'quiz' && (
                <div className={styles.quizList}>
                  {quizList.map((quiz, idx) => (
                    <div key={quiz.id || idx} className={styles.quizCard}>
                      <div className={styles.quizHeader}>
                        <span className={styles.quizIndex}>Q{idx + 1}</span>
                        <h4 className={styles.quizTitle}>{quiz.question}</h4>
                      </div>
                      <ul className={styles.optionList}>
                        {quiz.options?.map((opt, optIdx) => (
                          <li 
                            key={optIdx} 
                            className={`${styles.optionItem} ${quiz.userAnswer === opt ? styles.selectedOption : ''}`}
                            onClick={() => handleSelectAnswer(quiz.id, opt)}
                          >
                            <span className={styles.optionNum}>{optIdx + 1}</span>
                            {opt}
                          </li>
                        ))}
                      </ul>
                      {quiz.userAnswer && (
                        <div className={`${styles.explanationBox} ${quiz.isCorrect ? styles.correctBox : styles.wrongBox}`}>
                          <div className={styles.resultTitle}>
                            {quiz.isCorrect ? " 정답입니다!" : " 아쉽네요, 틀렸습니다."}
                          </div>
                          <p><strong>정답:</strong> {quiz.answer}</p>
                          <p><strong>해설:</strong> {quiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'summary' && (
                <div className={styles.summaryCard}>
                  <h3> AI 스마트 요약</h3>
                  <p className={styles.summaryText}>
                    {summaryData?.summary || "업로드하신 자료를 분석하여 추출한 핵심 요약 내용입니다."}
                  </p>
                  <div className={styles.divider}></div>
                  <h4>추출된 주요 키워드</h4>
                  <div className={styles.tagWrapper}>
                    {summaryData?.keywords ? (
                      summaryData.keywords.map((kw, idx) => (
                        <span key={idx} className={styles.keywordTag}>#{kw}</span>
                      ))
                    ) : (
                      <>
                        <span className={styles.keywordTag}>#핵심개념</span>
                        <span className={styles.keywordTag}>#요약노트</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'wrongNotes' && (
                <div className={styles.wrongNotesContainer}>
                  {wrongNotes.length === 0 ? (
                    <div className={styles.emptyWrong}>틀린 문제가 없습니다! 모든 문제를 맞추셨어요.</div>
                  ) : (
                    wrongNotes.map((item, idx) => (
                      <div key={idx} className={styles.quizCard}>
                        <span className={styles.wrongBadge}>오답</span>
                        <h4 className={styles.quizTitle}>Q. {item.question}</h4>
                        <div className={styles.wrongAnswerDetail}>
                          <p className={styles.myAnswer}>내 제출 답: {item.userAnswer}</p>
                          <p className={styles.correctAnswer}>정답: {item.answer}</p>
                        </div>
                        <div className={styles.explanationBox}>
                          <p><strong>해설:</strong> {item.explanation}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* 하단 액션 바 (기존 유지) */}
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
        </main>
      </div>

      {/* 모달 (기존 유지) */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>AI 문제 생성 설정</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>이미지 첨부</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }}
                />
                <div 
                  className={styles.imageUploadBox}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="미리보기" className={styles.previewImage} />
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <span className={styles.uploadIcon}></span>
                      <span>클릭하여 교재/필기 이미지 업로드</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>문제 유형</label>
                <select className={styles.selectInput} value={quizType} onChange={(e) => setQuizType(e.target.value)}>
                  <option value="multiple">객관식 (4보기)</option>
                  <option value="short">주관식 단답형</option>
                  <option value="ox">O / X 퀴즈</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>난이도</label>
                  <select className={styles.selectInput} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="low">쉬움 (하)</option>
                    <option value="medium">보통 (중)</option>
                    <option value="high">어려움 (상)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>문항 수</label>
                  <select className={styles.selectInput} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
                    <option value={3}>3문항</option>
                    <option value={5}>5문항</option>
                    <option value={10}>10문항</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>추가 요청사항</label>
                <input 
                  type="text"
                  className={styles.textInput}
                  placeholder="예: 개념 위주로 문제 내줘, 해설을 자세히 적어줘"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>
                취소
              </button>
              <button 
                className={styles.submitBtn} 
                onClick={handleUploadSubmit}
              >
                {loading ? "AI가 문제를 생성하는 중..." : "문제 생성 시작"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfStudy;