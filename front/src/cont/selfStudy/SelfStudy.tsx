import React, { useState } from 'react';
import { SelfStudyHeader } from './SelfStudyHeader';
import { MainTabContent } from './MainTabContent';
import { RightSidebar } from './RightSidebar';
import QuizModal from './QuizModal';
import { Quiz, MainTabType, RightTabType, Category, Subject } from './types';
import styles from './selfstudy.module.css';

const MOCK_CATEGORIES: Category[] = [
  { categoryId: 1, categoryName: '프로그래밍 / 개발' },
  { categoryId: 2, categoryName: '자격증 및 시험' },
  { categoryId: 3, categoryName: '어학 / 외국어' },
];

const MOCK_SUBJECTS: Subject[] = [
  { subjectId: 101, categoryId: 1, subjectName: 'Java', usageCount: 10 },
  { subjectId: 102, categoryId: 1, subjectName: 'Python', usageCount: 5 },
  { subjectId: 103, categoryId: 1, subjectName: 'Spring Boot', usageCount: 8 },
  { subjectId: 201, categoryId: 2, subjectName: '정보처리기사', usageCount: 15 },
  { subjectId: 202, categoryId: 2, subjectName: 'SQLD', usageCount: 12 },
];

  const SelfStudy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTabType>('quiz');
  const [rightTab, setRightTab] = useState<RightTabType>('my');
  
  const [searchFilter, setSearchFilter] = useState<string>('name');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // ERD 기준 카테고리/과목 ID 상태 (숫자형 ID)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // ERD(quiz_sessions) 매핑 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quizType, setQuizType] = useState<string>('MULTIPLE_CHOICE');
  const [quizDifficulty, setQuizDifficulty] = useState<string>('MEDIUM');
  const [quizCount, setQuizCount] = useState<number>(3);
  const [quizPrompt, setQuizPrompt] = useState<string>('');

  // ERD(quizzes) 기반 문제 및 오답 데이터
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [wrongNotes, setWrongNotes] = useState<Quiz[]>([]);

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
    setQuizPrompt('');
  };

  // 백엔드로 quiz_sessions 생성 요청
  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      alert("이미지를 선택해주세요.");
      return;
    }
    if (!selectedSubjectId) {
      alert("과목을 선택해주세요.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);                         // quiz_image_url 용 파일
    formData.append("subjectId", String(selectedSubjectId));       // subject_id
    formData.append("userId", "user_01");                          // user_id
    formData.append("quizType", quizType);                         // quiz_type
    formData.append("quizDifficulty", quizDifficulty);             // quiz_difficulty
    formData.append("quizCount", String(quizCount));               // quiz_count
    formData.append("quizPrompt", quizPrompt);                     // quiz_prompt

    try {
      const response = await fetch("http://192.198.0.19:3000/generate-quiz", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("서버 응답 오류");

      const data = await response.json();
      const parsedData = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;

      // 백엔드에서 반환하는 개별 퀴즈 목록 (quizzes)
      if (parsedData.quizzes) {
        setQuizList(parsedData.quizzes);
      }

      handleCloseModal();
      setActiveTab('quiz');
    } catch (error) {
      console.error("문제 생성 중 오류:", error);
      alert("문제를 생성하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 문제 풀이 시 채점 및 오답노트 저장 logic
  const handleSelectAnswer = (quizId: number, selectedOpt: string) => {
    setQuizList((prevList) =>
      prevList.map((q) => {
        if (q.quizId === quizId) {
          const isCorrect = q.quizCorrectAnswer === selectedOpt;
          const updatedQuiz: Quiz = { 
            ...q, 
            quizUserResponse: selectedOpt, 
            quizCorrect: isCorrect ? 'Y' : 'N' 
          };

          if (!isCorrect) {
            setWrongNotes((prevWrong) => {
              if (!prevWrong.some((item) => item.quizId === q.quizId)) {
                return [...prevWrong, updatedQuiz];
              }
              return prevWrong;
            });
          }
          return updatedQuiz;
        }
        return q;
      })
    );
  };

  return (
    <div className={styles.container}>
      <SelfStudyHeader />

      <div className={styles.layoutWrapper}>
        <MainTabContent
          activeTab={activeTab}
          setActiveTab={setActiveTab} 
          setIsModalOpen={setIsModalOpen}
          quizList={quizList}
          wrongNotes={wrongNotes}
          handleSelectAnswer={handleSelectAnswer}
        />

        <RightSidebar
          rightTab={rightTab}
          setRightTab={setRightTab}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
        />
      </div>

      <QuizModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        loading={loading}
        previewUrl={previewUrl}
        quizType={quizType}
        setQuizType={setQuizType}
        quizDifficulty={quizDifficulty}
        setQuizDifficulty={setQuizDifficulty}
        quizCount={quizCount}
        setQuizCount={setQuizCount}
        quizPrompt={quizPrompt}
        setQuizPrompt={setQuizPrompt}
        handleFileChange={handleFileChange}
        handleUploadSubmit={handleUploadSubmit}
        categories={MOCK_CATEGORIES}
        subjects={MOCK_SUBJECTS}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
      />
    </div>
  );
};

export default SelfStudy;