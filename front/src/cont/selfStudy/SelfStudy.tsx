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

const SELF_STUDY_GENERATION_POINT_COST = 1_000;


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

const parseArrayResponse = (value: unknown): unknown[] | null => {
  let parsed = value;

  for (let depth = 0; depth < 2 && typeof parsed === 'string'; depth += 1) {
    if (!parsed.trim()) {
      return [];
    }

    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  return Array.isArray(parsed) ? parsed : null;
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

  const path = value.trim().replace(/(^|\/)quiz-images\//, '$1imgfile/quiz/');

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

  const [quizTimerStartedAt, setQuizTimerStartedAt] =
    useState<number | null>(null);
  const [quizTimerRunning, setQuizTimerRunning] = useState(false);
  const [quizElapsedSeconds, setQuizElapsedSeconds] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const [activeTab, setActiveTab] =
    useState<MainTabType>('quiz');

  const [generatedCategoryName, setGeneratedCategoryName] = useState('');
  const [generatedSubjectName, setGeneratedSubjectName] = useState('');
  const [classificationMode, setClassificationMode] = useState<'auto' | 'manual'>('auto');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

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

  const resetQuizTimer = useCallback(() => {
    setQuizTimerStartedAt(null);
    setQuizTimerRunning(false);
    setQuizElapsedSeconds(0);
  }, []);

  useEffect(() => {
    if (quizTimerStartedAt === null || !quizTimerRunning) return;

    const updateElapsedTime = () => {
      setQuizElapsedSeconds(
        Math.floor((Date.now() - quizTimerStartedAt) / 1000)
      );
    };

    updateElapsedTime();
    const intervalId = window.setInterval(updateElapsedTime, 1000);
    return () => window.clearInterval(intervalId);
  }, [quizTimerStartedAt, quizTimerRunning]);

  const handleStartQuiz = () => {
    if (
      quizSessionId === null ||
      quizList.length === 0 ||
      quizTimerStartedAt !== null ||
      submitted
    ) {
      return;
    }

    setQuizTimerStartedAt(Date.now());
    setQuizElapsedSeconds(0);
    setQuizTimerRunning(true);
  };

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setCategories([]);
      return;
    }

    axios.get(`${BACKEND_URL}/api/selfstudy/categories`, {
      headers: getAuthHeaders(),
    }).then(({ data }) => {
      const mapped: Category[] = Array.isArray(data)
        ? data.map((item: any) => ({
            categoryId: Number(item.categoryId ?? item.category_id),
            categoryName: String(item.categoryName ?? item.category_name ?? ''),
          })).filter((item: Category) => Number.isFinite(item.categoryId) && item.categoryName.trim())
        : [];
      if (!cancelled) setCategories(mapped);
    }).catch(() => {
      if (!cancelled) setCategories([]);
    });

    return () => { cancelled = true; };
  }, [token, getAuthHeaders]);

  useEffect(() => {
    let cancelled = false;
    setSubjects([]);
    setSelectedSubjectId(null);
    if (selectedCategoryId === null || !token) return;

    axios.get(`${BACKEND_URL}/api/selfstudy/subjects`, {
      params: { categoryId: selectedCategoryId },
      headers: getAuthHeaders(),
    }).then(({ data }) => {
      const mapped: Subject[] = Array.isArray(data)
        ? data.map((item: any) => ({
            subjectId: Number(item.subjectId ?? item.subject_id),
            categoryId: Number(item.categoryId ?? item.category_id),
            subjectName: String(item.subjectName ?? item.subject_name ?? ''),
          })).filter((item: Subject) =>
            Number.isFinite(item.subjectId) &&
            item.categoryId === selectedCategoryId &&
            item.subjectName.trim()
          )
        : [];
      if (!cancelled) setSubjects(mapped);
    }).catch(() => {
      if (!cancelled) setSubjects([]);
    });

    return () => { cancelled = true; };
  }, [selectedCategoryId, token, getAuthHeaders]);

  // =========================================================
  // 1. 로그인 회원의 학습 기록 조회
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

      const sessionsData = parseArrayResponse(sessionsResponse.data);
      const resultsData = parseArrayResponse(resultsResponse.data);

      if (
        !sessionsData ||
        !resultsData
      ) {
        const describeResponse = (value: unknown) => {
          if (Array.isArray(value)) return 'array';
          if (value === null) return 'null';
          if (typeof value === 'object') {
            return `object(${Object.keys(value).join(', ')})`;
          }
          return typeof value;
        };

        throw new Error(
          `학습 기록 응답 형식이 올바르지 않습니다. sessions=${describeResponse(sessionsResponse.data)}, results=${describeResponse(resultsResponse.data)}`
        );
      }

      const sessions: QuizSession[] =
        sessionsData
          .map(normalizeSession)
          .filter(
            (session: QuizSession) =>
              Number.isFinite(session.quizSessionId) &&
              Number(session.quizSessionId) > 0
          );

      const results: SelfStudyResult[] =
        resultsData
          .map(normalizeResult)
          .filter(
            (result: SelfStudyResult) =>
              Number.isFinite(result.selfstudyResultsId) &&
              result.selfstudyResultsId > 0
          );

      setSavedSessions(sessions);
      setSavedResults(results);
    } catch (error) {
      console.error('학습 기록 조회 실패:', error);
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
    resetQuizTimer();
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
  }, [token, member_num, resetQuizTimer]);

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
      resetQuizTimer();
      setGeneratedCategoryName('');
      setGeneratedSubjectName('');
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
        resetQuizTimer();
        setGeneratedCategoryName('');
        setGeneratedSubjectName('');
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

  const validateUploadInput = (): File | null => {
    if (loading) return null;

    if (classificationMode === 'manual' && selectedSubjectId === null) {
      alert('직접 지정 모드에서는 카테고리와 과목을 선택해주세요.');
      return null;
    }

    if (!selectedFile) {
      alert('문제 생성에 사용할 이미지를 첨부해주세요.');
      return null;
    }

    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type) ||
      selectedFile.size > 10 * 1024 * 1024
    ) {
      alert('10MB 이하의 JPG, PNG, WebP 이미지를 선택해주세요.');
      return null;
    }

    if (!requireLogin()) return null;

    const confirmed = window.confirm(
      `AI 문제 생성 1회당 ${SELF_STUDY_GENERATION_POINT_COST.toLocaleString()}P가 사용됩니다.\n` +
      '문제 생성과 저장이 완료된 경우에만 차감됩니다. 계속하시겠습니까?'
    );

    return confirmed ? selectedFile : null;
  };

  const buildUploadFormData = (file: File): FormData => {
    const formData = new FormData();
    formData.append('file', file);
    if (classificationMode === 'manual' && selectedSubjectId !== null) {
      formData.append('subject_id', String(selectedSubjectId));
    }
    formData.append('quiz_type', quizType);
    formData.append('quiz_difficulty', quizDifficulty);
    formData.append('quiz_count', String(quizCount));
    formData.append('quiz_prompt', quizPrompt);
    return formData;
  };

  const requestGeneratedQuizzes = async (formData: FormData) => {
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
      !data.quizSessionId ||
      !data.categoryName ||
      !data.subjectName
    ) {
      throw new Error(
        '문제 생성 응답이 올바르지 않습니다. 학습 기록을 확인해주세요.'
      );
    }

    return data;
  };

  const applyGeneratedQuiz = (data: any, file: File) => {
    setQuizList(data.quizzes);
    setQuizSessionId(data.quizSessionId);
    resetQuizTimer();
    setGeneratedCategoryName(String(data.categoryName));
    setGeneratedSubjectName(String(data.subjectName));
    setSubmitted(false);
    setScore(null);
    setWrongNotes([]);
    setActiveTab('quiz');

    if (studyImageUrlRef.current) {
      URL.revokeObjectURL(studyImageUrlRef.current);
    }

    const newStudyImageUrl = URL.createObjectURL(file);
    studyImageUrlRef.current = newStudyImageUrl;
    setStudyImageUrl(newStudyImageUrl);

    setIsModalOpen(false);
    setSelectedFile(null);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreviewUrl(null);
    setQuizPrompt('');
  };

  const showUploadError = (error: unknown) => {
    console.error('AI 문제 생성 오류:');

    const message =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    const pointNotice = message.includes('포인트 잔액이 부족')
      ? '\n\n포인트는 차감되지 않았습니다. 포인트를 충전한 뒤 다시 시도해주세요.'
      : '';

    alert(
      `문제 생성 요청을 완료하지 못했습니다.\n\n` +
      `${message}${pointNotice}\n\n` +
      `입력한 내용은 유지됩니다.`
    );
  };

  const refreshUploadHistory = async () => {
    await loadHistory().catch(() => {
      console.error('학습 기록 갱신 실패:');
    });
  };

  const handleUploadSubmit = async () => {
    const file = validateUploadInput();
    if (!file) return;

    setLoading(true);
    try {
      const formData = buildUploadFormData(file);
      const data = await requestGeneratedQuizzes(formData);
      applyGeneratedQuiz(data, file);
      await refreshUploadHistory();
    } catch (error) {
      showUploadError(error);
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

    if (quizTimerStartedAt === null) {
      alert('시험 시작 버튼을 먼저 눌러주세요.');
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

    setQuizElapsedSeconds(
      Math.floor((Date.now() - quizTimerStartedAt) / 1000)
    );
    setQuizTimerRunning(false);
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
          onStartQuiz={handleStartQuiz}
          quizStarted={quizTimerStartedAt !== null}
          quizElapsedSeconds={quizElapsedSeconds}
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
          categoryName={generatedCategoryName}
          subjectName={generatedSubjectName}
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
        classificationMode={classificationMode}
        setClassificationMode={setClassificationMode}
        categories={categories}
        subjects={subjects}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        pointCost={SELF_STUDY_GENERATION_POINT_COST}
      />
    </div>
  );
};

export default SelfStudy;
