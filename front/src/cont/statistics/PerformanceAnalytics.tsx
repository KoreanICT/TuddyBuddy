import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, Award, BookOpen, Brain, Clock, MessageSquareQuote, TrendingUp } from 'lucide-react';
import { ChartDataState, LLMFeedbackState } from './types';
import './PerformanceAnalytics.css';

// 카테고리 목록
const CATEGORIES = [
    { id: 'CS_CERT', name: '정보처리기사 (자격증)' },
    { id: 'GOV_9TH', name: '9급 공무원 행정학 (공시)' },
    { id: 'HIGH_MATH', name: '고등 수학 (상) (고등교과)' },
];

export default function PerformanceAnalytics() {
    // 0. Selected category state
    const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0].id);

    // 1. 차트용 데이터 유즈스테이트 (히스토리 + 예측결과)
    const [chartData, setChartData] = useState<ChartDataState | null>(null);

    // 2. LLM 평가 컨설팅용 유즈스테이트
    const [llmFeedback, setLlmFeedback] = useState<LLMFeedbackState | null>(null);

    // 로딩 상태 및 에러 상태 관리
    const [loading, setLoading] = useState<boolean>(true);

    // --------------------------------------------------------------------------
    // 카테고리 변경 시 useEffect로 axios 데이터 비동기 수신 및 분할 처리
    // --------------------------------------------------------------------------
    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                // 스프링부트 API 호출 (예시 엔드포인트)
                // 백엔드에서 { chartData: {...}, llmFeedback: {...} } 형태로 보낸다고 가정
                const response = await axios.get(`/api/v1/analytics/${selectedCategory}`);

                // 받아온 JSON 데이터를 두 개의 State로 분할 주입!
                setChartData(response.data.chartData);
                setLlmFeedback(response.data.llmFeedback);

            } catch (error) {
                console.error("데이터 로딩 실패:", error);

                // 개발용 더미 데이터 세팅 (백엔드 미연동 시 테스트용)
                setChartData({
                    history: [
                        { round: '1회차', score: 55, date: '08-01' },
                        { round: '2회차', score: 65, date: '08-10' },
                        { round: '3회차', score: 60, date: '08-20' },
                        { round: '4회차', score: 75, date: '08-30' },
                    ],
                    prediction: [
                        { name: '최근 평균', score: 63.7, type: 'actual' },
                        { name: '다음 시험 예측', score: 82.0, type: 'predict' },
                    ],
                    subjectShare: [
                        { name: '소프트웨어 설계', value: 35, color: '#2563eb' },
                        { name: '소프트웨어 개발', value: 25, color: '#0284c7' },
                        { name: '데이터베이스 구축', value: 20, color: '#059669' },
                    ]
                });

                setLlmFeedback({
                    mentorComment: "데이터를 불러오는 중 문제가 발생했거나 아직 백엔드가 준비되지 않았습니다.",
                    weaknesses: [{ category: '시스템', riskLevel: '주의', reason: '서버 연결 확인 필요' }],
                    consultingPath: ['스프링부트 서버 상태를 확인하세요.']
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [selectedCategory]);

    if (loading) {
        return <div className="analytics-page container">데이터를 불러오는 중입니다...</div>;
    }

    return (
        <div className="analytics-page">
            <div className="container">

                {/* 상단 헤더 & 카테고리 셀렉터 */}
                <header className="analytics-header">
                    <div className="header-title">
                        <h1>📊 AI 학습 성적 분석 & 멘토링</h1>
                        <p>모의고사 데이터를 바탕으로 ML 예측 및 LLM 팩트폭격 컨설팅을 제공합니다.</p>
                    </div>

                    <div className="category-selector">
                        <BookOpen className="icon" size={18} />
                        <label htmlFor="category-select" className="label">학습 과목:</label>
                        <select
                            id="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="select-box"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </header>

                {/* 1. 차트 영역 (chartData가 존재할 때만 렌더링) */}
                {chartData && (
                    <section className="charts-grid">

                        {/* 지난 성적 추이 */}
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

                        {/* 예측 성적 */}
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

                        {/* 공부 지분 */}
                        <div className="card chart-card">
                            <div className="card-header">
                                <Clock className="icon warning" size={20} />
                                <h2>자주 공부하는 과목 지분</h2>
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
                                                <Cell key={`cell-${index}`} fill={entry.color} />
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

                {/* 2. LLM 평가 컨설팅 영역 (llmFeedback이 존재할 때만 렌더링) */}
                {llmFeedback && (
                    <section className="card feedback-card">

                        <div className="feedback-section">
                            <div className="card-header danger">
                                <MessageSquareQuote size={22} />
                                <h2>AI 1타 강사의 팩트폭격 멘토링</h2>
                            </div>
                            <div className="mentor-speech-box">
                                <p>"{llmFeedback.mentorComment}"</p>
                            </div>
                        </div>

                        <div className="consulting-grid">

                            {/* 집중 보완 영역 */}
                            <div className="consulting-col">
                                <h3 className="section-title">
                                    <AlertTriangle className="icon warning" size={16} /> 집중 보완이 필요한 취약 영역
                                </h3>
                                <div className="weakness-list">
                                    {llmFeedback.weaknesses.map((item, idx) => (
                                        <div key={idx} className="weakness-item">
                                            <div className="weakness-head">
                                                <span className="subject">{item.category}</span>
                                                <span className={`badge ${item.riskLevel === '고위험' ? 'danger' : 'warning'}`}>
                                                    {item.riskLevel}
                                                </span>
                                            </div>
                                            <p className="reason">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 컨설팅 경로 */}
                            <div className="consulting-col">
                                <h3 className="section-title">
                                    <Brain className="icon primary" size={16} /> 맞춤형 성적 탈출 컨설팅 경로
                                </h3>
                                <ol className="consulting-path">
                                    {llmFeedback.consultingPath.map((step, idx) => (
                                        <li key={idx}>
                                            <span className="step-num">{idx + 1}</span>
                                            <span className="step-text">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                        </div>

                    </section>
                )}

            </div>
        </div>
    );
}