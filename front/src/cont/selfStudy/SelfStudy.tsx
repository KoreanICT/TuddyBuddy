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
const BACKEND_URL = 'http://localhost/back';


const SelfStudy: React.FC = () => {

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
        console.log(
          '카테고리 조회 결과:',
          response.data
        );
        setCategories(response.data);
      } catch (error) {
        console.error(
          '카테고리 조회 실패:',
          error
        );
        alert('카테고리를 불러오지 못했습니다.');
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
        setSubjects(response.data);
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
    // 이미지 검사
    if (!selectedFile) {
      alert('이미지를 선택해주세요.');
      return;
    }
    // 과목 검사
    if (selectedSubjectId === null) {
      alert('과목을 선택해주세요.');
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // =====================================================
    // AI server data
    // =====================================================

    formData.append(
      'file',
      selectedFile
    );
    formData.append(
      'subjectId',
      String(selectedSubjectId)
    );
    formData.append(
      'quizType',
      quizType
    );
    formData.append(
      'quizDifficulty',
      quizDifficulty
    );

    formData.append(
      'quizCount',
      String(quizCount)
    );
    formData.append(
      'quizPrompt',
      quizPrompt
    );

    try {
      const response = await fetch(
        'http://192.198.0.19:3000/generate-quiz',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `AI 서버 응답 오류: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        'AI 문제 생성 결과:',
        data
      );

      // ===================================================
      // AI sever result processing
      // ===================================================

      const parsedData =
        typeof data.result === 'string'
          ? JSON.parse(data.result)
          : data.result;

      if (
        parsedData &&
        Array.isArray(parsedData.quizzes)
      ) {
        setQuizList(
          parsedData.quizzes
        );

      } else {
        console.warn(
          'quizzes 데이터가 없습니다.',
          parsedData
        );
        setQuizList([]);

      }
      // 문제 생성 완료
      setActiveTab('quiz');
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        '문제 생성 중 오류:',
        error
      );
      alert(
        '문제를 생성하지 못했습니다.'
      );
    } finally {
      setLoading(false);

    }

  };

  // =========================================================
  // 6. CorrectAnswer
  // =========================================================

  const handleSelectAnswer = (
    quizId: number,
    selectedOpt: string
  ) => {
    setQuizList((prevList) => {
      return prevList.map((q) => {
        if (q.quizId !== quizId) {
          return q;
        }

        const isCorrect =
          q.quizCorrectAnswer === selectedOpt;

        const updatedQuiz: Quiz = {
          ...q,
          quizUserResponse:
            selectedOpt,
          quizCorrect:
            isCorrect
              ? 'Y'
              : 'N',

        };

        // =================================================
        // WrongNotes
        // =================================================
        if (!isCorrect) {
          setWrongNotes((prevWrong) => {

            // 이미 등록된 문제인지 확인
            const alreadyExists =
              prevWrong.some(
                (item) =>
                  item.quizId === q.quizId
              );

            if (alreadyExists) {

              // 기존 오답 업데이트
              return prevWrong.map(
                (item) =>
                  item.quizId === q.quizId
                    ? updatedQuiz
                    : item
              );
            }

            // 새로운 오답 추가
            return [
              ...prevWrong,
              updatedQuiz,
            ];

          });

        } else {

          // 다시 풀어서 정답이 된 경우 오답노트에서 제거
          setWrongNotes((prevWrong) =>
            prevWrong.filter(
              (item) =>
                item.quizId !== q.quizId
            )
          );
        }
        return updatedQuiz;
      });
    });
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
        quizDifficulty={
          quizDifficulty
        }
        setQuizDifficulty={
          setQuizDifficulty
        }
        quizCount={quizCount}
        setQuizCount={setQuizCount}
        quizPrompt={quizPrompt}
        setQuizPrompt={setQuizPrompt}
        handleFileChange={
          handleFileChange
        }
        handleUploadSubmit={
          handleUploadSubmit
        }
        categories={categories}
        subjects={subjects}
        selectedCategoryId={
          selectedCategoryId
        }
        setSelectedCategoryId={
          setSelectedCategoryId
        }
        selectedSubjectId={
          selectedSubjectId
        }
        setSelectedSubjectId={
          setSelectedSubjectId
        }
      />

    </div>
  );
};

export default SelfStudy;