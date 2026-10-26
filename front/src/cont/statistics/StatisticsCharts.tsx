import React from 'react';
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
    PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';
import type { PolarAngleAxisProps } from 'recharts';
import { Award, TrendingUp } from 'lucide-react';
import { CategoryAverageScore, StatisticsDetailChartsProps, StatisticsOverviewChartsProps } from './types';
import './PerformanceAnalytics.css';

const categoryChartColors = ['#4f46e5', '#0f9d8a', '#f59e0b', '#e45b76', '#5574c9'];

// Recharts 3의 반환 타입(ReactNode)을 TypeScript 4.4가 JSX 컴포넌트로 인정하지 않아 해당 축만 JSX 타입으로 한정합니다.
const PolarAngleAxisForJsx = PolarAngleAxis as unknown as React.ComponentType<PolarAngleAxisProps>;

// 레이더 축 속성은 Recharts가 제공하는 props 타입 그대로 유지합니다.
function renderRadarAxes() {
    return (
        <>
            <PolarAngleAxisForJsx dataKey="categoryName" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} angle={30} tick={{ fontSize: 10 }} />
        </>
    );
}

// 전체 카테고리 평균 레이더 차트와 응시 비중 원형 차트를 출력합니다.
export function StatisticsOverviewCharts({ metrics }: StatisticsOverviewChartsProps) {
    const radarMetrics: CategoryAverageScore[] = metrics.filter((category) =>
        typeof category.categoryName === 'string'
        && category.categoryName.trim() !== ''
        && Number.isFinite(category.averageScore)
        && category.averageScore >= 0
        && category.averageScore <= 100
    );

    return (
        <div className="analytics-overview-charts">
            <article className="analytics-overview-chart">
                <h2>카테고리별 평균 점수</h2>
                {radarMetrics.length >= 3 ? (
                    <div className="analytics-overview-chart-body">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarMetrics}>
                                <PolarGrid />
                                {renderRadarAxes()}
                                <Radar
                                    name="평균 점수"
                                    dataKey="averageScore"
                                    stroke="#4f46e5"
                                    fill="#4f46e5"
                                    fillOpacity={0.24}
                                />
                                <Tooltip formatter={(value) => [`${value}점`, '카테고리 평균']} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="analytics-overview-empty">
                        {radarMetrics.length === 0
                            ? '표시할 수 있는 카테고리 평균 점수가 아직 없어요.'
                            : '레이더 차트 비교를 위해 시험 기록이 있는 카테고리가 3개 이상 필요해요.'}
                    </p>
                )}
            </article>

            <article className="analytics-overview-chart">
                <h2>전체 응시 비중</h2>
                {metrics.length > 0 ? (
                    <div className="analytics-overview-chart-body">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics}
                                    dataKey="attempts"
                                    nameKey="categoryName"
                                    innerRadius="48%"
                                    outerRadius="76%"
                                    paddingAngle={3}
                                >
                                    {metrics.map((category, index) => (
                                        <Cell key={category.categoryId} fill={categoryChartColors[index % categoryChartColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}회`, '응시 횟수']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="analytics-overview-empty">아직 표시할 시험 기록이 없어요.</p>
                )}
            </article>
        </div>
    );
}

// 선택 카테고리의 회차별 성적, LLM 예측, 과목별 오답 차트를 기존 UI 그대로 출력합니다.
export function StatisticsDetailCharts({ chartData }: StatisticsDetailChartsProps) {
    if (!chartData) return null;

    return (
        <section className="charts-grid">
            {/* 시험 이력의 회차별 점수를 선 그래프로 표시합니다. */}
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

            {/* 최근 평균과 LLM 예측 점수를 막대 그래프로 비교합니다. */}
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

            {/* API가 제공하는 과목별 오답 건수를 가로 막대 그래프로 표시합니다. */}
            <div className="card chart-card analytics-subject-errors-card">
                <div className="card-header">
                    <TrendingUp className="icon warning" size={20} />
                    <h2>과목별 오답 현황</h2>
                </div>
                {chartData.subjectShare.length === 0 ? (
                    <p className="analytics-subject-errors-empty">표시할 과목별 오답 데이터가 없습니다.</p>
                ) : (
                    <div className="chart-wrapper analytics-subject-errors-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[...chartData.subjectShare].sort((a, b) => b.value - a.value)}
                                layout="vertical"
                                margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                <XAxis type="number" allowDecimals={false} stroke="var(--text-secondary)" fontSize={12} />
                                <YAxis type="category" dataKey="name" width={112} stroke="var(--text-secondary)" fontSize={12} />
                                <Tooltip formatter={(value) => [`${value}건`, '오답 수']} />
                                <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={22} name="오답 수" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </section>
    );
}
