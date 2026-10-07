import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SelfStudyHeader } from './SelfStudyHeader';
import { MainTabContent } from './MainTabContent';
import { RightSidebar } from './RightSidebar';
import QuizModal from './QuizModal';

import {
  Quiz,
  MainTabType,
  RightTabType,
  Category,
  Subject,
} from './types';

import styles from './selfstudy.module.css';

// Spring Boot 백엔드
// server.port=80
// server.servlet.context-path=/back
const BACKEND_URL = (process.env.REACT_APP_BACK_END_URL || 'http://localhost/back').replace(/\/$/, '');

const SelfStudy: React.FC = () => {

  const [quizSessionId, setQuizSessionId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const handleSubmitQuiz = async () => {
    if (submitting || submitted || quizSessionId === null) return;
    if (quizList.some(q => !q.quizUserResponse?.trim())) { alert('모든 문제에 답해주세요.'); return; }
    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/selfstudy/submit`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_sessionid: quizSessionId,
          responses: quizList.map(q => ({ quiz_id: q.quizId, quiz_user_response: q.quizUserResponse })) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '답안 저장 실패');
      setScore(result.selfstudy_total_score); setSubmitted(true);
    } catch (error) { alert(error instanceof Error ? error.message : '답안 저장 실패'); }
    finally { setSubmitting(false); }
  };

  // =========================================================
  // Tab
  // =========================================================

  const [activeTab, setActiveTab] =
    useState<MainTabType>('quiz');

  const [rightTab, setRightTab] =
    useState<RightTabType>('my');

  // =========================================================
  // search
  // =========================================================

  const [searchFilter, setSearchFilter] =
    useState<string>('name');

  const [searchKeyword, setSearchKeyword] =
    useState<string>('');

  // =========================================================
  // categories / subjects
  // =========================================================

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] =
    useState<number | null>(null);


  // =========================================================
  // modal
  // =========================================================

  const [isModalOpen, setIsModalOpen] =
    useState<boolean>(false);

  const [loading, setLoading] =
    useState<boolean>(false);


  // =========================================================
  // quiz_sessions
  // =========================================================

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [quizType, setQuizType] =
    useState<string>('MULTIPLE_CHOICE');

  const [quizDifficulty, setQuizDifficulty] =
    useState<string>('MEDIUM');

  const [quizCount, setQuizCount] =
    useState<number>(3);

  const [quizPrompt, setQuizPrompt] =
    useState<string>('');


  // =========================================================
  // quizzes
  // =========================================================

  const [quizList, setQuizList] =
    useState<Quiz[]>([]);

  const [wrongNotes, setWrongNotes] =
    useState<Quiz[]>([]);

  // =========================================================
  // getCategories
  // =========================================================

  useEffect(() => {
  const getCategories = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/selfstudy/categories`
      );

      console.log('카테고리 원본 데이터:', response.data);

      const mappedCategories: Category[] = response.data.map(
        (cat: any) => ({
          categoryId: cat.category_id,
          categoryName: cat.category_name,
        })
      );

      console.log('변환된 카테고리:', mappedCategories);

      setCategories(mappedCategories);

    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  getCategories();
}, []);



  // =========================================================
  // 2. selectedCategory
  // =========================================================

  useEffect(() => {
    if (selectedCategoryId === null) {
      setSubjects([]);
      setSelectedSubjectId(null);
      return;
    }

    const getSubjects = async () => {

      try {

        const response = await axios.get(
          `${BACKEND_URL}/api/selfstudy/subjects`,
          {
            params: {
              categoryId: selectedCategoryId,
            },
          }
        );
        console.log(
          '과목 조회 결과:',
          response.data
        );
        setSubjects(
          response.data.map((sub: any) => ({
            subjectId: sub.subject_id,
            categoryId: sub.category_id,
            subjectName: sub.subject_name,
            usageCount: sub.usage_count,
            createdAt: sub.created_at,
          }))
        );
      } catch (error) {

        console.error(
          '과목 조회 실패:',
          error
        );

        setSubjects([]);
        setSelectedSubjectId(null);
        alert('과목을 불러오지 못했습니다.');
      }
    };

    getSubjects();

  }, [selectedCategoryId]);

  // =========================================================
  // 3.SelectedFile
  // =========================================================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (
      e.target.files &&
      e.target.files.length > 0
    ) {

      const file = e.target.files[0];
      setSelectedFile(file);
      // 기존 미리보기 URL이 있으면 해제
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(
        URL.createObjectURL(file)
      );
    }

  };

  // =========================================================
  // 4. CloseModal
  // =========================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setQuizPrompt('');
    setSelectedCategoryId(null);
    setSelectedSubjectId(null);

  };


  // =========================================================
  // 5. generate-quiz
  // =========================================================

  const handleUploadSubmit = async () => {
    if (loading) return;
    if (!selectedFile || selectedSubjectId === null) {
      alert('이미지와 과목을 선택해주세요.'); return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type) || selectedFile.size > 10 * 1024 * 1024) {
      alert('10MB 이하의 JPG, PNG, WebP 이미지를 선택해주세요.'); return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('subject_id', String(selectedSubjectId));
    formData.append('quiz_type', quizType);
    formData.append('quiz_difficulty', quizDifficulty);
    formData.append('quiz_count', String(quizCount));
    formData.append('quiz_prompt', quizPrompt);
    try {
      const response = await fetch(`${BACKEND_URL}/api/selfstudy/generate`, {
        method: 'POST', credentials: 'include', body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.detail || '문제 생성에 실패했습니다.');
      if (!Array.isArray(data.quizzes) || !data.quizSessionId) throw new Error('응답 형식이 올바르지 않습니다.');
      setQuizList(data.quizzes);
      setQuizSessionId(data.quizSessionId);
      setSubmitted(false); setScore(null);
      setWrongNotes([]);
      setActiveTab('quiz');
      handleCloseModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : '문제를 생성하지 못했습니다.');
    } finally { setLoading(false); }
  };

  // =========================================================
  // 6. CorrectAnswer
  // =========================================================

  const handleSelectAnswer = (
    quizId: number,
    selectedOpt: string
  ) => {
    if (submitting || submitted) return;
    const current = quizList.find(q => q.quizId === quizId);
    if (!current) return;
    const correct = current.quizCorrectAnswer.trim().toLocaleLowerCase() === selectedOpt.trim().toLocaleLowerCase();
    const updated: Quiz = { ...current, quizUserResponse: selectedOpt, quizCorrect: correct ? 'Y' : 'N' };
    setQuizList(prev => prev.map(q => q.quizId === quizId ? updated : q));
    setWrongNotes(prev => correct ? prev.filter(q => q.quizId !== quizId)
      : [...prev.filter(q => q.quizId !== quizId), updated]);
  };


  // =========================================================
  // 7.preview URL
  // =========================================================

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <SelfStudyHeader />
      <div className={styles.layoutWrapper}>

        {/* ================================================
            main
        ================================================ */}
        <MainTabContent
          onSubmit={handleSubmitQuiz}
          submitting={submitting}
          submitted={submitted}
          score={score}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsModalOpen={setIsModalOpen}
          quizList={quizList}
          wrongNotes={wrongNotes}
          handleSelectAnswer={
            handleSelectAnswer
          }

        />

        {/* ================================================
            RightSidebar
        ================================================ */}
        <RightSidebar
          rightTab={rightTab}
          setRightTab={setRightTab}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
        />
      </div>


      {/* ================================================
          QuizModal
      ================================================ */}
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
        categories={categories}
        subjects={subjects}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
      />
    </div>
  );
};


export default SelfStudy;