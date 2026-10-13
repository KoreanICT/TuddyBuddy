// ==========================================
// DB 스키마 기반 기본 엔티티 인터페이스
// ==========================================

export interface Category {
    categoryId: number;
    categoryName: string;
}

export interface Subject {
    subjectId: number;
    categoryId: number;
    subjectName: string;
    usageCount: number;
}

// ==========================================
// PerformanceAnalytics 전용 데이터 인터페이스
// ==========================================

// 1. 차트용 데이터 인터페이스
export interface HistoryItem {
    resultId: number;        // selfstudy_results_id
    round: string;           // 예: '1회차'
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
    color: string;           // 차트 표시 색상
}

export interface ChartDataState {
    history: HistoryItem[];
    prediction: PredictionItem[];
    subjectShare: SubjectShareItem[];
}

// LLM 평가/컨설팅용 데이터 인터페이스 (quiz_responses 오답 기반)
export interface WeaknessItem {
    subjectName: string;     // 취약 과목/단원명
    reason: string;          // 오답 원인 및 보완점 (quiz_responses 기반)
}

export interface LLMFeedbackState {
    mentorComment: string;   // llm멘트
    weaknesses: WeaknessItem[];
    consultingPath: string[]; // 탈출 컨설팅 경로
}