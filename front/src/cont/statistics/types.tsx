//김진규
// ==========================================
// DB 스키마 기반 기본 엔티티 인터페이스
// ==========================================

export interface Category {
    categoryId: number;
    categoryName: string;
}

// ==========================================
// PerformanceAnalytics 전용 데이터 인터페이스
// ==========================================

// 1. 차트용 데이터 인터페이스
export interface HistoryItem {
    resultId: number;        // selfstudy_results_id
    round: number | string;  // 백엔드 회차 값 또는 표시용 문자열
    score: number;           // selfstudy_total_score (예: 75)
    date: string;            // submitted_at (예: '08-30')
}

export interface PredictionItem {
    name: string;            // 예: '최근 평균', '다음 시험 예측'
    score: number;           // 예: 82.0
    type: 'actual' | 'predict';
}

export interface SubjectShareItem {
    subjectId?: number;      // subject_id
    name: string;            // 과목명 또는 단원명
    value: number;           // 풀이 문제 비중/정답률 (%)
    color?: string;          // 백엔드 응답에 색상이 없을 때 UI 기본 색상 사용
}

export interface ChartDataState {
    history: HistoryItem[];
    prediction: PredictionItem[];
    subjectShare: SubjectShareItem[];
}

// LLM 취약점은 백엔드 문자열 응답 또는 화면 더미데이터 객체 형식
export interface WeaknessItem {
    subjectName: string;
    reason: string;
}

export interface LLMFeedbackState {
    mentorComment: string;   // llm멘트
    weaknesses: (string | WeaknessItem)[];
    consultingPath: string[]; // 탈출 컨설팅 경로
}
