//김진규
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, Award, BookOpen, Brain, Clock, MessageSquareQuote, TrendingUp } from 'lucide-react';
import { CategoryOption, ChartDataState, LLMFeedbackState, PersistedStatisticsAnalysis, StatisticsApiResponse } from './types';
import './PerformanceAnalytics.css';
import { useAuth } from '../../login/hooks/useAuth';

const STATISTICS_ANALYSIS_STORAGE_KEY = 'tuddybuddy:statistics-analysis';

export default function PerformanceAnalytics() {
    const { memberNum, token } = useAuth();

    // /getCategories에서 받은 카테고리 목록과 선택된 실제 DB category_id
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // 회원의 전체 카테고리 응답을 한 번 보관하고, 선택 카테고리에 따라 화면 상태를 갱신합니다.
    const [allStatistics, setAllStatistics] = useState<StatisticsApiResponse | null>(null);

    // 차트용 데이터 State
    const [chartData, setChartData] = useState<ChartDataState | null>(null);

    // LLM 평가 컨설팅 State
    const [llmFeedback, setLlmFeedback] = useState<LLMFeedbackState | null>(null);

    // 로딩 및 에러 상태
    const [loading, setLoading] = useState<boolean>(false);
    const [analysisUnlocked, setAnalysisUnlocked] = useState<boolean>(false);
    const [analysisOwnerMemberNum, setAnalysisOwnerMemberNum] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // 현재 인증 회원 전용 저장 데이터를 불러와 화면 이동·새로고침 뒤에도 결과를 복원합니다.
    useEffect(() => {
        if (memberNum == null || !Number.isSafeInteger(memberNum) || memberNum <= 0) return;

        const storageKey = STATISTICS_ANALYSIS_STORAGE_KEY;
        try {
            const savedValue = localStorage.getItem(storageKey);
            if (!savedValue) return;

            const saved = JSON.parse(savedValue) as PersistedStatisticsAnalysis;
            const isValid = saved.cacheVersion === 1
                && saved.memberNum === memberNum
                && Array.isArray(saved.categories)
                && saved.categories.length > 0
                && saved.categories.every((category) =>
                    Number.isSafeInteger(category.categoryId) && typeof category.categoryName === 'string'
                )
                && saved.response?.chartData != null
                && Array.isArray(saved.response.chartData.history)
                && Array.isArray(saved.response.chartData.prediction?.categoryPredictions)
                && Array.isArray(saved.response.chartData.subjectShare)
                && Array.isArray(saved.response.llmFeedback?.categoryAnalyses);

            if (!isValid) {
                localStorage.removeItem(storageKey);
                return;
            }

            const selectedCategoryExists = saved.categories.some(
                (category) => category.categoryId === saved.selectedCategoryId
            );
            setCategories(saved.categories);
            setSelectedCategoryId(selectedCategoryExists
                ? saved.selectedCategoryId
                : saved.categories[0].categoryId);
            setAllStatistics(saved.response);
            setAnalysisOwnerMemberNum(memberNum);
            setAnalysisUnlocked(true);
        } catch (error) {
            console.error('저장된 평가분석 결과를 복원하지 못했습니다:', error);
            localStorage.removeItem(storageKey);
        }
    }, [memberNum]);

    // 다른 탭에서 로그아웃해 저장 응답이 삭제되면 현재 탭의 메모리 데이터도 즉시 폐기합니다.
    useEffect(() => {
        const clearAnalysisOnStorageRemoval = (event: StorageEvent) => {
            if (event.key !== STATISTICS_ANALYSIS_STORAGE_KEY || event.newValue !== null) return;
            setCategories([]);
            setSelectedCategoryId(null);
            setAllStatistics(null);
            setChartData(null);
            setLlmFeedback(null);
            setAnalysisOwnerMemberNum(null);
            setAnalysisUnlocked(false);
        };

        window.addEventListener('storage', clearAnalysisOnStorageRemoval);
        return () => window.removeEventListener('storage', clearAnalysisOnStorageRemoval);
    }, []);

    // 선택된 categoryId와 일치하는 응답만 차트 및 평가분석 화면 상태에 반영합니다.
    // 카테고리를 바꿔도 서버 재요청이나 추가 포인트 차감은 발생하지 않습니다.
    useEffect(() => {
        if (!allStatistics || selectedCategoryId === null || analysisOwnerMemberNum !== memberNum) {
            setChartData(null);
            setLlmFeedback(null);
            return;
        }

        const responseChartData = allStatistics.chartData;
        const history = responseChartData.history.filter(
            (item) => item.categoryId === selectedCategoryId
        ).map((item, index) => ({
            ...item,
            round: `${index + 1}회`,
        }));
        const prediction = responseChartData.prediction.categoryPredictions
            .filter((category) => category.categoryIds.includes(selectedCategoryId))
            .flatMap((category) =>
                category.prediction.map((item) => ({
                    ...item,
                    name: `${category.categoryName} · ${item.name}`,
                    categoryId: selectedCategoryId,
                    categoryIds: category.categoryIds,
                    categoryName: category.categoryName,
                }))
            );
        const subjectShare = responseChartData.subjectShare.filter(
            (item) => item.categoryId === selectedCategoryId
        );
        const categoryAnalyses = allStatistics.llmFeedback.categoryAnalyses.filter(
            (analysis) => analysis.categoryIds.includes(selectedCategoryId)
        );

        setChartData({ history, prediction, subjectShare });
        setLlmFeedback({ categoryAnalyses });
    }, [allStatistics, analysisOwnerMemberNum, memberNum, selectedCategoryId]);

    // 응답과 마지막 선택 카테고리를 로그인 세션 동안 보관합니다. 저장 실패가 결제 성공 상태를 덮지 않게 분리합니다.
    useEffect(() => {
        if (memberNum == null || analysisOwnerMemberNum !== memberNum
            || !allStatistics || selectedCategoryId === null || categories.length === 0) return;

        const saved: PersistedStatisticsAnalysis = {
            cacheVersion: 1,
            memberNum,
            selectedCategoryId,
            categories,
            response: allStatistics,
        };
        try {
            localStorage.setItem(
                STATISTICS_ANALYSIS_STORAGE_KEY,
                JSON.stringify(saved)
            );
        } catch (error) {
            console.error('평가분석 결과를 브라우저에 저장하지 못했습니다:', error);
        }
    }, [allStatistics, analysisOwnerMemberNum, categories, memberNum, selectedCategoryId]);

    const handleStartAnalysis = async () => {
        if (!window.confirm('평가분석 및 성적예측에 1,000포인트가 사용됩니다. 진행하시겠습니까?')) return;

        setLoading(true);
        setErrorMessage('');
        try {
            if (typeof token !== 'string' || token.trim() === '') {
                throw new Error('로그인 토큰을 확인할 수 없습니다.');
            }
            if (memberNum == null || !Number.isFinite(memberNum) || memberNum <= 0) {
                throw new Error('회원 번호를 확인할 수 없습니다.');
            }

            const headers = { Authorization: `Bearer ${token}` };
            const categoriesResponse = await axios.post<CategoryOption[]>(`${process.env.REACT_APP_BACK_END_URL}/api/statistics/getCategories`, {
                memberNum,
            }, { headers });

            if (!Array.isArray(categoriesResponse.data)) {
                throw new Error('카테고리 응답 형식이 올바르지 않습니다.');
            }
            if (categoriesResponse.data.length === 0) {
                throw new Error('분석할 카테고리가 없습니다.');
            }
            setCategories(categoriesResponse.data);
            setSelectedCategoryId(categoriesResponse.data[0].categoryId);

            const response = await axios.post<StatisticsApiResponse>(`${process.env.REACT_APP_BACK_END_URL}/api/statistics/getStatistics`, {
                memberNum,
                description: '평가분석 및 성적예측 이용',
            }, { headers });

            const firstCategoryId = categoriesResponse.data[0].categoryId;
            const saved: PersistedStatisticsAnalysis = {
                cacheVersion: 1,
                memberNum,
                selectedCategoryId: firstCategoryId,
                categories: categoriesResponse.data,
                response: response.data,
            };
            try {
                localStorage.setItem(
                    STATISTICS_ANALYSIS_STORAGE_KEY,
                    JSON.stringify(saved)
                );
            } catch (error) {
                console.error('평가분석 결과를 브라우저에 저장하지 못했습니다:', error);
            }

            setAnalysisOwnerMemberNum(memberNum);
            setAllStatistics(response.data);
            setAnalysisUnlocked(true);
        } catch (error) {
            console.error('평가분석 요청 실패:', error);
            setErrorMessage('평가분석을 완료하지 못했습니다. 서버 처리 결과를 확인한 뒤 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    if (!analysisUnlocked || analysisOwnerMemberNum !== memberNum) {
        return (
            <div className="analytics-page">
                <div className="container">
                    <section className="card feedback-card" role="dialog" aria-labelledby="analysis-gate-title">
                        <h2 id="analysis-gate-title">AI 평가분석 및 성적예측</h2>
                        <p>분석 결과는 잠겨 있습니다. 진행하면 1,000포인트가 사용됩니다.</p>
                        {errorMessage && <p role="alert">{errorMessage}</p>}
                        <button type="button" onClick={handleStartAnalysis} disabled={loading}>
                            {loading ? '카테고리 및 분석 데이터를 불러오는 중...' : '1,000포인트로 평가분석 시작'}
                        </button>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="container">

                {/* 상단 헤더 & 과목 셀렉터 */}
                <header className="analytics-header">
                    <div className="header-title">
                        <h1>📊 AI 학습 성적 분석 & 멘토링</h1>
                        <p>성적 이력과 오답 로그를 바탕으로 LLM 성적 예측과 평가분석 컨설팅을 제공합니다.</p>
                    </div>

                    <div className="category-selector">
                        <BookOpen className="icon" size={18} />
                        <label htmlFor="subject-select" className="label">학습 과목:</label>
                        <select
                            id="subject-select"
                            value={selectedCategoryId ?? ''}
                            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                            className="select-box"
                        >
                            {categories.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                {/* 1. 차트 영역 */}
                {chartData && (
                    <section className="charts-grid">

                        {/* 지난 성적 추이 (selfstudy_results) */}
                        <div className="card chart-card">
                            <div className="card-header">
                                <TrendingUp className="icon primary" size={20} />
                                <h2>지난 성적 변화 추이</h2>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData.history}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="round" stroke="var(--text-secondary)" fontSize={12} />
                                        <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5, fill: 'var(--primary)' }} name="점수" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* LLM 예측 성적 */}
                        <div className="card chart-card">
                            <div className="card-header">
                                <Award className="icon success" size={20} />
                                <h2>LLM 성적 예측</h2>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData.prediction}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                                        <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} />
                                        <Tooltip />
                                        <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40} name="예측 점수">
                                            {chartData.prediction.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.type === 'predict' ? '#059669' : '#94a3b8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 학습/문제 출제 지분 */}
                        <div className="card chart-card">
                            <div className="card-header">
                                <Clock className="icon warning" size={20} />
                                <h2>자주 공부하는 과목/단원 지분</h2>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData.subjectShare}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={75}
                                            paddingAngle={4}
                                        >
                                            {chartData.subjectShare.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color ?? '#2563eb'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </section>
                )}

                {/* 2. LLM 평가 컨설팅 영역 */}
                {llmFeedback && (
                    <section className="card feedback-card">
                        {llmFeedback.categoryAnalyses.length === 0 ? (
                            <p>선택한 카테고리의 평가분석 데이터가 없습니다.</p>
                        ) : llmFeedback.categoryAnalyses.map((analysis) => (
                            <div className="feedback-section" key={analysis.categoryIds.join('-')}>
                                <div className="card-header danger">
                                    <MessageSquareQuote size={22} />
                                    <h2>{analysis.categoryName} 평가분석</h2>
                                </div>
                                <div className="mentor-speech-box">
                                    <p>"{analysis.mentorComment}"</p>
                                </div>

                                <div className="consulting-grid">
                                    <div className="consulting-col">
                                        <h3 className="section-title">
                                            <AlertTriangle className="icon warning" size={16} /> 집중 보완 단원 및 원인 분석
                                        </h3>
                                        <div className="weakness-list">
                                            {analysis.weaknesses.map((weakness, idx) => (
                                                <div key={idx} className="weakness-item">
                                                    <p className="reason">{weakness}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="consulting-col">
                                        <h3 className="section-title">
                                            <Brain className="icon primary" size={16} /> 맞춤형 성적 탈출 컨설팅 경로
                                        </h3>
                                        <ol className="consulting-path">
                                            {analysis.consultingPath.map((step, idx) => (
                                                <li key={idx}>
                                                    <span className="step-num">{idx + 1}</span>
                                                    <span className="step-text">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

            </div>
        </div>
    );
}
