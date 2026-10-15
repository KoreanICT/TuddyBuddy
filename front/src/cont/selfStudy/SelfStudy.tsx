
 //최솔
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

const BACKEND_URL = (
  process.env.REACT_APP_BACK_END_URL ||
  'http://192.168.0.19/back'
).replace(/\/$/, '');

const SelfStudy: React.FC = () => {
  const [quizSessionId, setQuizSessionId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<MainTabType>('quiz');
  const [rightTab, setRightTab] = useState<RightTabType>('my');

  const [searchFilter, setSearchFilter] = useState<string>('name');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] =
    useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [quizType, setQuizType] = useState('MULTIPLE_CHOICE');
  const [quizDifficulty, setQuizDifficulty] = useState('MEDIUM');
  const [quizCount, setQuizCount] = useState(3);
  const [quizPrompt, setQuizPrompt] = useState('');

  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [wrongNotes, setWrongNotes] = useState<Quiz[]>([]);

  // =========================================================
  // 1. 카테고리 조회 - 이미지 첨부와 무관하게 실행
  // =========================================================
  useEffect(() => {
    let cancelled = false;

    const getCategories = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/selfstudy/categories`
        );

        console.log('카테고리 원본 데이터:', response.data);

        if (!Array.isArray(response.data)) {
          throw new Error('카테고리 응답이 배열 형식이 아닙니다.');
        }

        const mappedCategories: Category[] = response.data
          .map((cat: any) => ({
            categoryId: Number(cat.categoryId ?? cat.category_id),
            categoryName: String(
              cat.categoryName ?? cat.category_name ?? ''
            ),
          }))
          .filter(
            (cat: Category) =>
              Number.isFinite(cat.categoryId) &&
              cat.categoryName.trim() !== ''
          );

        console.log('변환된 카테고리:', mappedCategories);

        if (!cancelled) {
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('카테고리 조회 실패:', error);

        if (!cancelled) {
          setCategories([]);
        }
      }
    };

    void getCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // 2. 카테고리 선택 시 과목 조회
  // =========================================================
  useEffect(() => {
    let cancelled = false;

    setSubjects([]);
    setSelectedSubjectId(null);

    if (selectedCategoryId === null) {
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

        console.log('과목 원본 데이터:', response.data);

        if (!Array.isArray(response.data)) {
          throw new Error('과목 응답이 배열 형식이 아닙니다.');
        }

        const mappedSubjects: Subject[] = response.data
          .map((sub: any) => ({
            subjectId: Number(sub.subjectId ?? sub.subject_id),
            categoryId: Number(sub.categoryId ?? sub.category_id),
            subjectName: String(
              sub.subjectName ?? sub.subject_name ?? ''
            ),
            usageCount: sub.usageCount ?? sub.usage_count,
            createdAt: sub.createdAt ?? sub.created_at,
          }))
          .filter(
            (sub: Subject) =>
              Number.isFinite(sub.subjectId) &&
              sub.categoryId === selectedCategoryId &&
              sub.subjectName.trim() !== ''
          );

        if (!cancelled) {
          setSubjects(mappedSubjects);
        }
      } catch (error) {
        console.error('과목 조회 실패:', error);

        if (!cancelled) {
          setSubjects([]);
          setSelectedSubjectId(null);
          alert('과목을 불러오지 못했습니다.');
        }
      }
    };

    void getSubjects();

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId]);

  // =========================================================
  // 3. 이미지 첨부
  // =========================================================
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  // =========================================================
  // 4. 모달 닫기
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
  // 5. AI 문제 생성
  // =========================================================
  const handleUploadSubmit = async () => {
    if (loading) return;

    if (selectedSubjectId === null) {
      alert('카테고리와 과목을 선택해주세요.');
      return;
    }

    if (!selectedFile) {
      alert('문제 생성에 사용할 이미지를 첨부해주세요.');
      return;
    }

    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(
        selectedFile.type
      ) ||
      selectedFile.size > 10 * 1024 * 1024
    ) {
      alert('10MB 이하의 JPG, PNG, WebP 이미지를 선택해주세요.');
      return;
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
      const response = await fetch(
        `${BACKEND_URL}/api/selfstudy/generate`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.detail || '문제 생성에 실패했습니다.'
        );
      }

      if (!Array.isArray(data.quizzes) || !data.quizSessionId) {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }

      setQuizList(data.quizzes);
      setQuizSessionId(data.quizSessionId);
      setSubmitted(false);
      setScore(null);
      setWrongNotes([]);
      setActiveTab('quiz');

      handleCloseModal();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '문제를 생성하지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 6. 정답 선택
  // =========================================================
  const handleSelectAnswer = (
    quizId: number,
    selectedOpt: string
  ) => {
    if (submitting || submitted) return;

    const current = quizList.find(
      (q) => q.quizId === quizId
    );

    if (!current) return;

    const correct =
      current.quizCorrectAnswer.trim().toLocaleLowerCase() ===
      selectedOpt.trim().toLocaleLowerCase();

    const updated: Quiz = {
      ...current,
      quizUserResponse: selectedOpt,
      quizCorrect: correct ? 'Y' : 'N',
    };

    setQuizList((prev) =>
      prev.map((q) =>
        q.quizId === quizId ? updated : q
      )
    );

    setWrongNotes((prev) =>
      correct
        ? prev.filter((q) => q.quizId !== quizId)
        : [
            ...prev.filter((q) => q.quizId !== quizId),
            updated,
          ]
    );
  };

  // =========================================================
  // 7. 답안 제출
  // =========================================================
  const handleSubmitQuiz = async () => {
    if (submitting || submitted || quizSessionId === null) {
      return;
    }

    if (quizList.some((q) => !q.quizUserResponse?.trim())) {
      alert('모든 문제에 답해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/selfstudy/submit`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quiz_sessionid: quizSessionId,
            responses: quizList.map((q) => ({
              quiz_id: q.quizId,
              quiz_user_response: q.quizUserResponse,
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '답안 저장 실패');
      }

      setScore(result.selfstudy_total_score);
      setSubmitted(true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '답안 저장 실패'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // 8. 이미지 URL 정리
  // =========================================================
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // =========================================================
  // 9. 화면 렌더링
  // =========================================================
  return (
    <div className={styles.container}>
      <SelfStudyHeader />

      <div className={styles.layoutWrapper}>
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
