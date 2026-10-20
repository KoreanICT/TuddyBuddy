//김진규
import React, { useState } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, Award, BookOpen, Brain, Clock, MessageSquareQuote, TrendingUp } from 'lucide-react';
import { ChartDataState, LLMFeedbackState, StatisticsApiResponse } from './types';
import './PerformanceAnalytics.css';
import { json } from 'stream/consumers';
import { useAuth } from '../../login/hooks/useAuth';

export default function PerformanceAnalytics() {
    const { memberNum, token } = useAuth();

    // 과목 목록 및 선택된 과목 ID (NUMBER 타입 PK 매핑)
    const [subjects, setSubjects] = useState<string[]>([]);
    const [categories, setCategories] = useState<string>("");

    // 차트용 데이터 State
    const [chartData, setChartData] = useState<ChartDataState | null>(null);

    // LLM 평가 컨설팅 State
    const [llmFeedback, setLlmFeedback] = useState<LLMFeedbackState | null>(null);

    // 로딩 및 에러 상태
    const [loading, setLoading] = useState<boolean>(false);
    const [analysisUnlocked, setAnalysisUnlocked] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

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
            const categoriesResponse = await axios.post(`${process.env.REACT_APP_BACK_END_URL}/api/statistics/getCategories`, {
                memberNum,
            }, { headers });

            if (!Array.isArray(categoriesResponse.data)) {
                throw new Error('카테고리 응답 형식이 올바르지 않습니다.');
            }
            if (categoriesResponse.data.length === 0) {
                throw new Error('분석할 카테고리가 없습니다.');
            }
            setSubjects(categoriesResponse.data);
            setCategories(categoriesResponse.data[0]);

            const response = await axios.post<StatisticsApiResponse>(`${process.env.REACT_APP_BACK_END_URL}/api/statistics/getStatistics`, {
                memberNum,
                description: '평가분석 및 성적예측 이용',
            }, { headers });

            const responseChartData = response.data.chartData;
            // 카테고리마다 나뉜 예측 항목들을 기존 차트가 받는 단일 배열로 평탄화합니다.
            // 각 항목의 원래 점수와 유형은 유지하고, 카테고리명은 차트 라벨에 붙여 구분합니다.
            const prediction = responseChartData.prediction.categoryPredictions.flatMap((category) =>
                category.prediction.map((item) => ({
                    ...item,
                    name: `${category.categoryName} · ${item.name}`,
                    categoryIds: category.categoryIds,
                    categoryName: category.categoryName,
                }))
            );

            setChartData({
                history: responseChartData.history,
                prediction,
                subjectShare: responseChartData.subjectShare,
            });
            setLlmFeedback(response.data.llmFeedback);
            setAnalysisUnlocked(true);
        } catch (error) {
            console.error('평가분석 요청 실패:', error);
            setErrorMessage('평가분석을 완료하지 못했습니다. 서버 처리 결과를 확인한 뒤 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    if (!analysisUnlocked) {
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
                        <p>selfstudy_results 및 오답 로그를 기반으로 ML 예측과 LLM 팩트폭격 컨설팅을 제공합니다.</p>
                    </div>

                    <div className="category-selector">
                        <BookOpen className="icon" size={18} />
                        <label htmlFor="subject-select" className="label">학습 과목:</label>
                        <select
                            id="subject-select"
                            value={categories}
                            onChange={(e) => setCategories(e.target.value)}
                            className="select-box"
                        >
                            {subjects.map((sub, i) => (
                                <option key={i} value={sub}>
                                    {sub}
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

                        {/* ML 예측 성적 */}
                        <div className="card chart-card">
                            <div className="card-header">
                                <Award className="icon success" size={20} />
                                <h2>ML 머신러닝 예측 성적</h2>
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
                        {llmFeedback.categoryAnalyses.map((analysis) => (
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
