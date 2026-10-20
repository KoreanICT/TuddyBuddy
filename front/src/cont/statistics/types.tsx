// PerformanceAnalytics에서 주고받는 API 및 화면 상태의 타입입니다.

// 성적 추이 차트에 표시하는 제출 결과 한 건입니다.
export interface HistoryItem {
    resultId: number;
    round: number | string;
    score: number;
    date: string;
}

// 카테고리별 예측 API의 개별 점수입니다.
export interface PredictionItem {
    name: string;
    score: number;
    type: 'actual' | 'predict';
    categoryIds?: number[];
    categoryName?: string;
}

// 과목/단원 비중 파이 차트에 표시하는 항목입니다.
export interface SubjectShareItem {
    subjectId?: number;
    name: string;
    value: number;
    color?: string;
}

// React hook: useState<ChartDataState | null>의 화면 표시용 차트 상태입니다.
// API의 중첩된 categoryPredictions는 이 상태를 만들 때 평탄화해 Recharts와 호환합니다.
export interface ChartDataState {
    history: HistoryItem[];
    prediction: PredictionItem[];
    subjectShare: SubjectShareItem[];
}

// 성적예측 API가 카테고리별로 반환하는 객체입니다.
export interface CategoryPrediction {
    categoryIds: number[];
    categoryName: string;
    prediction: PredictionItem[];
    mentorComment: string;
}

// 성적예측 API 응답의 prediction 필드입니다.
export interface PredictionResponse {
    categoryPredictions: CategoryPrediction[];
}

// 평가분석 API가 카테고리별로 반환하는 객체입니다.
export interface CategoryAnalysis {
    categoryIds: number[];
    categoryName: string;
    mentorComment: string;
    weaknesses: string[];
    consultingPath: string[];
}

// React hook: useState<LLMFeedbackState | null>에 저장하는 평가분석 화면 상태입니다.
// 백엔드 llmFeedback.categoryAnalyses 응답을 그대로 보유합니다.
export interface LLMFeedbackState {
    categoryAnalyses: CategoryAnalysis[];
}

// getStatistics가 반환하는 chartData의 API 원형입니다.
export interface StatisticsChartApiResponse {
    history: HistoryItem[];
    prediction: PredictionResponse;
    subjectShare: SubjectShareItem[];
}

// getStatistics의 전체 API 응답입니다. axios.post<StatisticsApiResponse>에 사용합니다.
export interface StatisticsApiResponse {
    chartData: StatisticsChartApiResponse;
    llmFeedback: LLMFeedbackState;
}
