// 1. categories 테이블
export interface Category {
  categoryId: number;
  categoryName: string;
}

// 2. subjects 테이블
export interface Subject {
  subjectId: number;
  categoryId: number;
  subjectName: string;
  usageCount?: number;
  createdAt?: string;
}

// 3. quizzes 테이블 (개별 문제)
export interface Quiz {
  quizId: number;
  quizSessionId?: number;
  quizQuestion: string;         // quiz_question
  quizSelections: string[];     // quiz_selections (보기 배열)
  quizCorrectAnswer: string;   // quiz_correct_answer
  quizExplanation: string;     // quiz_explanation
  quizUserResponse?: string;   // quiz_user_response (사용자 입력/선택 답)
  quizCorrect?: 'Y' | 'N';     // quiz_correct (채점 결과)
}

// 4. quiz_sessions 테이블 (문제 생성 요청/응답)
export interface QuizSession {
  quizSessionId?: number;
  subjectId: number;
  userId: string;
  quizImageUrl?: string;
  quizType: string;
  quizDifficulty: string;
  quizCount: number;
  quizPrompt?: string;
  createdAt?: string;
  quizzes?: Quiz[];
}

export type MainTabType = 'quiz' | 'wrongNotes';
export type RightTabType = 'my' | 'public' | 'create';