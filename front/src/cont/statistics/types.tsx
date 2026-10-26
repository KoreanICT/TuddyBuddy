// PerformanceAnalytics에서 주고받는 API 및 화면 상태의 타입입니다.

// /getCategories 응답과 카테고리 선택 상태에 사용하는 ID·이름 쌍입니다.
export interface CategoryOption {
    categoryId: number;
    categoryName: string;
}

// 종합 차트에서 카테고리별 평균 점수와 응시 비중을 표시하는 집계 항목입니다.
export interface CategoryAverageScore {
    categoryId: number;
    categoryName: string;
    attempts: number;
    averageScore: number;
}

// 종합 차트 컴포넌트에 전달하는 기존 화면 집계 데이터입니다.
export interface StatisticsOverviewChartsProps {
    metrics: CategoryAverageScore[];
}

// 선택 카테고리의 기존 차트 데이터를 표시하는 컴포넌트 입력입니다.
export interface StatisticsDetailChartsProps {
    chartData: ChartDataState | null;
}

// 성적 추이 차트에 표시하는 제출 결과 한 건입니다.
export interface HistoryItem {
    categoryId: number;
    resultId: number;
    round: number | string;
    score: number;
    date: string;
}

// 카테고리별 예측 API가 반환하는 개별 점수입니다.
export interface PredictionScoreItem {
    name: string;
    score: number;
    type: 'actual' | 'predict';
}

// 현재 선택 카테고리의 예측 점수를 차트에 표시하는 항목입니다.
export interface PredictionItem extends PredictionScoreItem {
    categoryId: number;
    categoryIds?: number[];
    categoryName?: string;
}

// 과목/단원 비중 파이 차트에 표시하는 항목입니다.
export interface SubjectShareItem {
    categoryId: number;
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
    prediction: PredictionScoreItem[];
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

// localStorage에서 현재 회원의 평가분석 응답과 마지막 카테고리를 확인·복원하기 위한 자료형입니다.
export interface PersistedStatisticsAnalysis {
    cacheVersion: 1;
    memberNum: number;
    selectedCategoryId: number;
    categories: CategoryOption[];
    response: StatisticsApiResponse;
}
