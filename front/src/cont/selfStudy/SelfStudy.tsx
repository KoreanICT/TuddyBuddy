import { BACKEND_URL, authenticatedFetch } from '../../login/authHttp';
// 최솔
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../login/reducers';

import { SelfStudyHeader } from './SelfStudyHeader';
import { MainTabContent } from './MainTabContent';
import { RightSidebar } from './RightSidebar';
import QuizModal from './QuizModal';

import {
  Quiz,
  QuizSession,
  SelfStudyResult,
  SavedQuizResponse,
  MainTabType,
  Category,
  Subject,
} from './types';

import styles from './selfstudy.module.css';



const getValue = (
  data: any,
  camel: string,
  snake: string
) => data?.[camel] ?? data?.[snake];

const parseSelections = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const normalizeQuiz = (data: any): Quiz => ({
  quizId: Number(getValue(data, 'quizId', 'quiz_id')),
  quizSessionId: Number(
    getValue(data, 'quizSessionId', 'quiz_session_id') ?? 0
  ),
  quizQuestion: String(
    getValue(data, 'quizQuestion', 'quiz_question') ?? ''
  ),
  quizSelections: parseSelections(
    getValue(data, 'quizSelections', 'quiz_selections')
  ),
  quizCorrectAnswer: String(
    getValue(data, 'quizCorrectAnswer', 'quiz_correct_answer') ?? ''
  ),
  quizExplanation: String(
    getValue(data, 'quizExplanation', 'quiz_explanation') ?? ''
  ),
});

const normalizeSession = (data: any): QuizSession => ({
  quizSessionId: Number(
    getValue(data, 'quizSessionId', 'quiz_session_id')
  ),
  subjectId: Number(
    getValue(data, 'subjectId', 'subject_id')
  ),
  userId: String(
    getValue(data, 'userId', 'user_id') ?? ''
  ),
  quizImageUrl: getValue(
    data,
    'quizImageUrl',
    'quiz_image_url'
  ),
  quizType: String(
    getValue(data, 'quizType', 'quiz_type') ?? ''
  ),
  quizDifficulty: String(
    getValue(data, 'quizDifficulty', 'quiz_difficulty') ?? ''
  ),
  quizCount: Number(
    getValue(data, 'quizCount', 'quiz_count') ?? 0
  ),
  quizPrompt: getValue(data, 'quizPrompt', 'quiz_prompt'),
  createdAt: getValue(data, 'createdAt', 'created_at'),
  quizSelections: [],
});

const normalizeResult = (data: any): SelfStudyResult => ({
  selfstudyResultsId: Number(
    getValue(
      data,
      'selfstudyResultsId',
      'selfstudy_results_id'
    )
  ),
  quizSessionId: Number(
    getValue(data, 'quizSessionId', 'quiz_session_id')
  ),
  memberNum: Number(
    getValue(data, 'memberNum', 'member_num') ?? 0
  ),
  selfstudyTotalScore: Number(
    getValue(
      data,
      'selfstudyTotalScore',
      'selfstudy_total_score'
    ) ?? 0
  ),
  submittedAt: getValue(
    data,
    'submittedAt',
    'submitted_at'
  ),
});

const normalizeResponse = (data: any): SavedQuizResponse => ({
  quizResponsesId: Number(
    getValue(data, 'quizResponsesId', 'quiz_responses_id') ?? 0
  ),
  selfstudyResultsId: Number(
    getValue(
      data,
      'selfstudyResultsId',
      'selfstudy_results_id'
    ) ?? 0
  ),
  quizId: Number(getValue(data, 'quizId', 'quiz_id')),
  quizUserResponse: String(
    getValue(data, 'quizUserResponse', 'quiz_user_response') ?? ''
  ),
  quizCorrect: String(
    getValue(data, 'quizCorrect', 'quiz_correct') ?? 'N'
  ).toUpperCase() === 'Y' ? 'Y' : 'N',
  submittedAt: getValue(data, 'submittedAt', 'submitted_at'),
});

const resolveImageUrl = (value?: string): string | null => {
  if (!value?.trim()) return null;

  const path = value.trim();

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith('blob:')) {
    return path;
  }

  if (path.startsWith('/back/')) {
    return `${new URL(BACKEND_URL).origin}${path}`;
  }

  return `${BACKEND_URL}/${path.replace(/^\/+/, '')}`;
};

const SelfStudy: React.FC = () => {
  const { token, member_num } = useSelector(
    (state: RootState) => state.auth
  );

  const getAuthHeaders = useCallback(
    (json = false): Record<string, string> => ({
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const requireLogin = () => {
    if (!token || member_num == null) {
      alert('로그인 후 이용할 수 있습니다.');
      return false;
    }
    return true;
  };

  // =========================================================
  // 상태 관리
  // =========================================================

  const [quizSessionId, setQuizSessionId] =
    useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const [activeTab, setActiveTab] =
    useState<MainTabType>('quiz');

  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] =
    useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [studyImageUrl, setStudyImageUrl] =
    useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);
  const studyImageUrlRef = useRef<string | null>(null);

  const [quizType, setQuizType] =
    useState('MULTIPLE_CHOICE');

  const [quizDifficulty, setQuizDifficulty] =
    useState('MEDIUM');

  const [quizCount, setQuizCount] = useState(3);
  const [quizPrompt, setQuizPrompt] = useState('');

  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [wrongNotes, setWrongNotes] = useState<Quiz[]>([]);

  // 저장된 학습 기록
  const [savedSessions, setSavedSessions] =
    useState<QuizSession[]>([]);

  const [savedResults, setSavedResults] =
    useState<SelfStudyResult[]>([]);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // 오래된 비동기 응답이 현재 학습을 덮어쓰지 않도록 관리
  const restoreRequestRef = useRef(0);

  // =========================================================
  // 1. 카테고리 조회
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setCategories([]);
      return;
    }

    const getCategories = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/selfstudy/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!Array.isArray(response.data)) {
          throw new Error(
            '카테고리 응답이 배열 형식이 아닙니다.'
          );
        }

        const mappedCategories: Category[] = response.data
          .map((cat: any) => ({
            categoryId: Number(
              cat.categoryId ?? cat.category_id
            ),
            categoryName: String(
              cat.categoryName ?? cat.category_name ?? ''
            ),
          }))
          .filter(
            (cat: Category) =>
              Number.isFinite(cat.categoryId) &&
              cat.categoryName.trim() !== ''
          );

        if (!cancelled) {
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('카테고리 조회 실패:');

        if (!cancelled) {
          setCategories([]);
        }
      }
    };

    void getCategories();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // =========================================================
  // 2. 카테고리 선택 시 과목 조회
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    setSubjects([]);
    setSelectedSubjectId(null);

    if (selectedCategoryId === null || !token) {
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!Array.isArray(response.data)) {
          throw new Error(
            '과목 응답이 배열 형식이 아닙니다.'
          );
        }

        const mappedSubjects: Subject[] = response.data
          .map((sub: any) => ({
            subjectId: Number(
              sub.subjectId ?? sub.subject_id
            ),
            categoryId: Number(
              sub.categoryId ?? sub.category_id
            ),
            subjectName: String(
              sub.subjectName ?? sub.subject_name ?? ''
            ),
            usageCount:
              sub.usageCount ?? sub.usage_count,
            createdAt:
              sub.createdAt ?? sub.created_at,
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
        console.error('과목 조회 실패:');

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
  }, [selectedCategoryId, token]);

  // =========================================================
  // 3. 로그인 회원의 학습 기록 조회
  // =========================================================

  const loadHistory = useCallback(async () => {
    if (!token || member_num == null) {
      setSavedSessions([]);
      setSavedResults([]);
      setHistoryError('');
      return;
    }

    setHistoryLoading(true);
    setHistoryError('');

    try {
      const [sessionsResponse, resultsResponse] =
        await Promise.all([
          axios.get(
            `${BACKEND_URL}/api/selfstudy/sessions`,
            { headers: getAuthHeaders() }
          ),
          axios.get(
            `${BACKEND_URL}/api/selfstudy/results`,
            { headers: getAuthHeaders() }
          ),
        ]);

      if (
        !Array.isArray(sessionsResponse.data) ||
        !Array.isArray(resultsResponse.data)
      ) {
        throw new Error(
          '학습 기록 응답 형식이 올바르지 않습니다.'
        );
      }

      const sessions: QuizSession[] =
        sessionsResponse.data
          .map(normalizeSession)
          .filter(
            (session: QuizSession) =>
              Number.isFinite(session.quizSessionId) &&
              Number(session.quizSessionId) > 0
          );

      const results: SelfStudyResult[] =
        resultsResponse.data
          .map(normalizeResult)
          .filter(
            (result: SelfStudyResult) =>
              Number.isFinite(result.selfstudyResultsId) &&
              result.selfstudyResultsId > 0
          );

      setSavedSessions(sessions);
      setSavedResults(results);
    } catch (error) {
      console.error('학습 기록 조회 실패:');
      setHistoryError(
        '저장된 학습 기록을 불러오지 못했습니다.'
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [token, member_num, getAuthHeaders]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  // 로그인 회원이 바뀌면 이전 회원의 화면 데이터 제거
  useEffect(() => {
    restoreRequestRef.current += 1;

    setQuizSessionId(null);
    setQuizList([]);
    setWrongNotes([]);
    setSubmitted(false);
    setScore(null);
    setActiveTab('quiz');
    setStudyImageUrl(null);

    if (studyImageUrlRef.current) {
      URL.revokeObjectURL(studyImageUrlRef.current);
      studyImageUrlRef.current = null;
    }
  }, [token, member_num]);

  // =========================================================
  // 4. 저장된 세션 복원
  // =========================================================

  const handleRestoreSession = async (sessionId: number) => {
    if (!requireLogin() || loading || submitting || deleting) {
      return;
    }

    const requestId = ++restoreRequestRef.current;

    setRestoring(true);

    try {
      const [sessionResponse, quizzesResponse] =
        await Promise.all([
          axios.get(
            `${BACKEND_URL}/api/selfstudy/sessions/${sessionId}`,
            { headers: getAuthHeaders() }
          ),
          axios.get(
            `${BACKEND_URL}/api/selfstudy/sessions/${sessionId}/quizzes`,
            { headers: getAuthHeaders() }
          ),
        ]);

      if (!Array.isArray(quizzesResponse.data)) {
        throw new Error(
          '저장된 문제 목록 형식이 올바르지 않습니다.'
        );
      }

      const session = normalizeSession(sessionResponse.data);

      if (session.quizSessionId !== sessionId) {
        throw new Error('학습 세션 정보가 일치하지 않습니다.');
      }

      let restoredQuizzes: Quiz[] =
        quizzesResponse.data.map(normalizeQuiz);

      if (!restoredQuizzes.length) {
        throw new Error(
          '해당 학습 세션에 저장된 문제가 없습니다.'
        );
      }

      const relatedResults = savedResults
        .filter((result) => result.quizSessionId === sessionId)
        .sort(
          (a, b) =>
            b.selfstudyResultsId - a.selfstudyResultsId
        );

      let restoredScore: number | null = null;
      let restoredSubmitted = false;

      if (relatedResults.length > 0) {
        const latestResult = relatedResults[0];

        const response = await axios.get(
          `${BACKEND_URL}/api/selfstudy/results/${latestResult.selfstudyResultsId}/responses`,
          { headers: getAuthHeaders() }
        );

        if (!Array.isArray(response.data)) {
          throw new Error(
            '저장된 답안 응답 형식이 올바르지 않습니다.'
          );
        }

        const responses: SavedQuizResponse[] =
          response.data.map(normalizeResponse);

        const responseMap = new Map<number, SavedQuizResponse>(
          responses.map((item) => [item.quizId, item])
        );

        restoredQuizzes = restoredQuizzes.map((quiz) => {
          const saved = responseMap.get(quiz.quizId);

          return saved
            ? {
                ...quiz,
                quizUserResponse: saved.quizUserResponse,
                quizCorrect: saved.quizCorrect,
              }
            : quiz;
        });

        restoredScore = latestResult.selfstudyTotalScore;
        restoredSubmitted = true;
      }

      if (requestId !== restoreRequestRef.current) {
        return;
      }

      if (studyImageUrlRef.current) {
        URL.revokeObjectURL(studyImageUrlRef.current);
        studyImageUrlRef.current = null;
      }

      setQuizSessionId(sessionId);
      setQuizList(restoredQuizzes);
      setWrongNotes(
        restoredQuizzes.filter(
          (quiz) => quiz.quizCorrect === 'N'
        )
      );
      setScore(restoredScore);
      setSubmitted(restoredSubmitted);
      setStudyImageUrl(
        resolveImageUrl(session.quizImageUrl)
      );
      setActiveTab('quiz');
    } catch (error) {
      if (requestId === restoreRequestRef.current) {
        console.error('학습 세션 복원 실패:');
        alert(
          error instanceof Error
            ? error.message
            : '학습 기록을 복원하지 못했습니다.'
        );
      }
    } finally {
      if (requestId === restoreRequestRef.current) {
        setRestoring(false);
      }
    }
  };

  // =========================================================
  // 5. 저장된 세션 삭제
  // =========================================================

  const handleDeleteSession = async (sessionId: number) => {
    if (
      !requireLogin() ||
      loading ||
      submitting ||
      restoring ||
      deleting
    ) {
      return;
    }

    if (
      !window.confirm(
        '이 학습 세션과 문제, 제출 기록을 삭제하시겠습니까?'
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      await axios.delete(
        `${BACKEND_URL}/api/selfstudy/sessions/${sessionId}`,
        { headers: getAuthHeaders() }
      );

      if (quizSessionId === sessionId) {
        restoreRequestRef.current += 1;

        setQuizSessionId(null);
        setQuizList([]);
        setWrongNotes([]);
        setScore(null);
        setSubmitted(false);
        setActiveTab('quiz');
        setStudyImageUrl(null);

        if (studyImageUrlRef.current) {
          URL.revokeObjectURL(studyImageUrlRef.current);
          studyImageUrlRef.current = null;
        }
      }

      await loadHistory();
    } catch (error) {
      console.error('학습 세션 삭제 실패:');
      alert('학습 기록을 삭제하지 못했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // 6. 이미지 첨부
  // =========================================================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const newUrl = URL.createObjectURL(file);

    previewUrlRef.current = newUrl;
    setPreviewUrl(newUrl);
  };

  // =========================================================
  // 7. 모달 닫기
  // =========================================================

  const handleCloseModal = () => {
    if (loading) return;

    setIsModalOpen(false);
    setSelectedFile(null);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreviewUrl(null);
    setQuizPrompt('');
    setSelectedCategoryId(null);
    setSelectedSubjectId(null);
  };

  // =========================================================
  // 8. AI 문제 생성
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
    !['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type) ||
    selectedFile.size > 10 * 1024 * 1024
  ) {
    alert('10MB 이하의 JPG, PNG, WebP 이미지를 선택해주세요.');
    return;
  }

  if (!requireLogin()) return;

  setLoading(true);

  const formData = new FormData();

  formData.append('file', selectedFile);
  formData.append('subject_id', String(selectedSubjectId));
  formData.append('quiz_type', quizType);
  formData.append('quiz_difficulty', quizDifficulty);
  formData.append('quiz_count', String(quizCount));
  formData.append('quiz_prompt', quizPrompt);

  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/api/selfstudy/generate`,
      {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: formData,
      }
    );

    const raw = await response.text();

    let data: any = {};

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        // JSON 형식이 아닌 서버 오류 응답 처리
      }
    }

    if (!response.ok) {
      const message =
        typeof data.message === 'string'
          ? data.message
          : typeof data.detail === 'string'
            ? data.detail
            : 'AI 문제 생성에 실패했습니다.';

      throw new Error(message);
    }

    if (
      !Array.isArray(data.quizzes) ||
      data.quizzes.length !== quizCount ||
      !data.quizSessionId
    ) {
      throw new Error(
        '문제 생성 응답이 올바르지 않습니다. 학습 기록을 확인해주세요.'
      );
    }

    // 정상 생성된 경우에만 학습 상태 변경
    setQuizList(data.quizzes);
    setQuizSessionId(data.quizSessionId);
    setSubmitted(false);
    setScore(null);
    setWrongNotes([]);
    setActiveTab('quiz');

    // 기존 학습 이미지 URL 정리
    if (studyImageUrlRef.current) {
      URL.revokeObjectURL(studyImageUrlRef.current);
    }

    const newStudyImageUrl = URL.createObjectURL(selectedFile);

    studyImageUrlRef.current = newStudyImageUrl;
    setStudyImageUrl(newStudyImageUrl);

    // 성공한 경우에만 모달 닫기
    setIsModalOpen(false);
    setSelectedFile(null);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreviewUrl(null);
    setQuizPrompt('');
    setSelectedCategoryId(null);
    setSelectedSubjectId(null);

    // 학습 기록 새로고침
    await loadHistory().catch((error) => {
      console.error('학습 기록 갱신 실패:');
    });

  } catch (error) {
    console.error('AI 문제 생성 오류:');

    const message =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';

    alert(
      `문제 생성 요청을 완료하지 못했습니다.\n\n` +
      `${message}\n\n` +
      `입력한 내용은 유지됩니다.`
    );

    // 실패 시 모달, 이미지, 과목, 문제 설정 유지
    // 기존 학습 문제와 학습 결과도 변경하지 않음

  } finally {
    setLoading(false);
  }
};

  // =========================================================
  // 9. 정답 선택
  // =========================================================

  const handleSelectAnswer = (
    quizId: number,
    selectedOpt: string
  ) => {
    if (submitting || submitted || restoring) return;

    setQuizList((prev) =>
      prev.map((quiz) => {
        if (quiz.quizId !== quizId) return quiz;

        const correct =
          quiz.quizCorrectAnswer.trim().toLocaleLowerCase() ===
          selectedOpt.trim().toLocaleLowerCase();

        return {
          ...quiz,
          quizUserResponse: selectedOpt,
          quizCorrect: correct ? 'Y' : 'N',
        };
      })
    );

    setWrongNotes((prev) => {
      const current = quizList.find(
        (quiz) => quiz.quizId === quizId
      );

      if (!current) return prev;

      const correct =
        current.quizCorrectAnswer.trim().toLocaleLowerCase() ===
        selectedOpt.trim().toLocaleLowerCase();

      if (correct) {
        return prev.filter((quiz) => quiz.quizId !== quizId);
      }

      const updated: Quiz = {
        ...current,
        quizUserResponse: selectedOpt,
        quizCorrect: 'N',
      };

      return [
        ...prev.filter((quiz) => quiz.quizId !== quizId),
        updated,
      ];
    });
  };

  // =========================================================
  // 10. 답안 제출
  // =========================================================

  const handleSubmitQuiz = async () => {
    if (
      submitting ||
      submitted ||
      restoring ||
      quizSessionId === null
    ) {
      return;
    }

    if (
      quizList.some(
        (quiz) => !quiz.quizUserResponse?.trim()
      )
    ) {
      alert('모든 문제에 답해주세요.');
      return;
    }

    if (!requireLogin()) return;

    setSubmitting(true);

    try {
      const response = await authenticatedFetch(
        `${BACKEND_URL}/api/selfstudy/submit`,
        {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            quiz_sessionid: quizSessionId,
            responses: quizList.map((quiz) => ({
              quiz_id: quiz.quizId,
              quiz_user_response: quiz.quizUserResponse,
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || '답안 저장 실패'
        );
      }

      setScore(
        Number(
          result.selfstudy_total_score ??
          result.selfstudyTotalScore
        )
      );

      setSubmitted(true);

      // 제출한 점수 및 결과를 학습 기록 목록에 반영
      await loadHistory();
    } catch (error) {
      console.error('답안 제출 실패:');

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
  // 11. 이미지 URL 정리
  // =========================================================

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      if (studyImageUrlRef.current) {
        URL.revokeObjectURL(studyImageUrlRef.current);
      }
    };
  }, []);

  // =========================================================
  // 12. 화면 렌더링
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
          previewUrl={studyImageUrl}
          restoring={restoring}
          deleting={deleting}
        />

        <RightSidebar
          savedSessions={savedSessions}
          savedResults={savedResults}
          currentSessionId={quizSessionId}
          historyLoading={historyLoading}
          restoring={restoring}
          deleting={deleting}
          historyError={historyError}
          onRefreshHistory={loadHistory}
          onRestoreSession={handleRestoreSession}
          onDeleteSession={handleDeleteSession}
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
