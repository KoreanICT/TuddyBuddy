import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, Award, BookOpen, Brain, Clock, MessageSquareQuote, TrendingUp } from 'lucide-react';
import { ChartDataState, LLMFeedbackState, Subject } from './types';
import './PerformanceAnalytics.css';

export default function PerformanceAnalytics() {

    // 유저 고유식별자 member_num 추출
    const [memberNum, setMemberNum] = useState<number>();

    // 과목 목록 및 선택된 과목 ID (NUMBER 타입 PK 매핑)
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number>(1);

    // 차트용 데이터 State
    const [chartData, setChartData] = useState<ChartDataState | null>(null);

    // LLM 평가 컨설팅 State
    const [llmFeedback, setLlmFeedback] = useState<LLMFeedbackState | null>(null);

    // 로딩 및 에러 상태
    const [loading, setLoading] = useState<boolean>(true);

    // --------------------------------------------------------------------------
    // 1. 초기 마운트 시 과목 목록(subjects) 조회
    // --------------------------------------------------------------------------
    useEffect(() => {

        //더미데이터 반드시 수정할것 > member_num
        setMemberNum(1)

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // 1. 먼저 DB에 저장된 성적 데이터 수집
                const savedResponse = await axios.post('/api/analytics', {
                    memberNum: memberNum,
                });

                // 타입가드
                if (!savedResponse.data && !savedResponse.data.chartData) return;
                    
                setChartData(savedResponse.data.chartData);
                setLlmFeedback(savedResponse.data.statistics);

            } catch (error) {
                console.error("분석 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedSubjectId]);

    // --------------------------------------------------------------------------
    // 2. 과목 변경 시 데이터 조회 (selfstudy_results 및 quiz_responses 기반 분석)
    // --------------------------------------------------------------------------
    useEffect(() => {
        if (!selectedSubjectId) return;

        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                // 스프링부트 API 호출: /api/v1/analytics/subjects/{subjectId}
                const response = await axios.get(`/api/analytics`);

                setChartData(response.data.chartData);
                setLlmFeedback(response.data.llmFeedback);

            } catch (error) {
                console.error("분석 데이터 로딩 실패 -> ERD 호환 더미 데이터 세팅:", error);

                // DB 스키마(selfstudy_results, quiz_responses) 구조에 부합하는 더미 데이터
                setChartData({
                    history: [
                        { resultId: 101, round: '1회차', score: 55, date: '08-01' },
                        { resultId: 102, round: '2회차', score: 65, date: '08-10' },
                        { resultId: 103, round: '3회차', score: 60, date: '08-20' },
                        { resultId: 104, round: '4회차', score: 75, date: '08-30' },
                    ],
                    prediction: [
                        { name: '최근 평균', score: 63.7, type: 'actual' },
                        { name: '다음 시험 예측', score: 82.0, type: 'predict' },
                    ],
                    subjectShare: [
                        { subjectId: 1, name: '소프트웨어 설계', value: 35, color: '#2563eb' },
                        { subjectId: 2, name: '소프트웨어 개발', value: 25, color: '#0284c7' },
                        { subjectId: 3, name: '데이터베이스 구축', value: 20, color: '#059669' },
                    ]
                });

                setLlmFeedback({
                    mentorComment: "4회차 점수는 상승했으나 quiz_responses 오답 분석 결과 데이터베이스 구축 단원 정답률이 30%에 불과합니다.",
                    weaknesses: [
                        { subjectName: '데이터베이스 구축', reason: 'B-Tree 인덱스 및 정규화 문제 연속 오답' },
                        { subjectName: '소프트웨어 설계', reason: '디자인 패턴 적용 문제 개념 혼동' }
                    ],
                    consultingPath: [
                        '1. quiz_responses 기반 오답노트에서 DB 정규화 문제 집중 재풀이',
                        '2. B-Tree 인덱스 개념 해설(quiz_explanation) 복습',
                        '3. 동일 과목 신규 quiz_session 생성 후 20문항 응시'
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [selectedSubjectId]);

    if (loading) {
        return <div className="analytics-page container">성적 분석 데이터를 산출하는 중입니다...</div>;
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
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                            className="select-box"
                        >
                            {subjects.map((sub) => (
                                <option key={sub.subjectId} value={sub.subjectId}>
                                    {sub.subjectName}
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

                {/* 2. LLM 평가 컨설팅 영역 */}
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
                                    <AlertTriangle className="icon warning" size={16} /> 집중 보완 단원 및 원인 분석
                                </h3>
                                <div className="weakness-list">
                                    {llmFeedback.weaknesses.map((item, idx) => (
                                        <div key={idx} className="weakness-item">
                                            <div className="weakness-head">
                                                <span className="subject">{item.subjectName}</span>
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