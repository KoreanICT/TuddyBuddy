// 1. 차트 영역용 데이터 인터페이스 (히스토리 + 예측결과)
export interface HistoryItem {
    round: string; // 예: '1회차'
    score: number; // 예: 75
    date: string;  // 예: '08-30'
}

export interface PredictionItem {
    name: string;  // 예: '최근 평균', '다음 시험 예측'
    score: number; // 예: 82.0
    type: 'actual' | 'predict';
}

export interface SubjectShareItem {
    name: string;  // 예: '소프트웨어 설계'
    value: number; // 예: 35 (%)
    color: string; // 예: '#2563eb'
}

export interface ChartDataState {
    history: HistoryItem[];
    prediction: PredictionItem[];
    subjectShare: SubjectShareItem[];
}

// 2. LLM 평가/컨설팅용 데이터 인터페이스
export interface LLMFeedbackState {
    mentorComment: string; // 매서운 1타 강사 한마디 (문자열)
    weaknesses: {
        category: string;
        riskLevel: string;
        reason: string;
    }[];
    consultingPath: string[];
}