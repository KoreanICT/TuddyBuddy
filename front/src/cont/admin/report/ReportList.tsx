import { BACKEND_URL } from '../../../login/authHttp';

// 주용현, 이주화

import axios from 'axios';
import { useAuth } from '../../../login/hooks/useAuth';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import styles from './report.module.css';

import { ReportType, REPORT_TYPES, REPORT_TYPE_LABELS } from '../../report/reportTarget';

type ReportStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'REJECTED';

interface ReportVO {
    num: number;
    member_num: number;
    target_num?: number | null;
    type: ReportType;
    category: string;
    content: string;
    status: ReportStatus;
    created_date: string;
}

interface ReportListResponse {
    data: ReportVO[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    startPage: number;
    endPage: number;
}

interface ReportStatistics {
    total: number;
    typeCounts: { name: string; count: number }[];
    reasonCounts: { name: string; value: number }[];
}

const COLORS = ['#0284c7', '#38bdf8', '#0e7490', '#7dd3fc', '#0369a1', '#67e8f9', '#94a3b8'];

const ReportList: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    const [reportList, setReportList] = useState<ReportVO[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
    const [statisticsLoading, setStatisticsLoading] = useState(true);
    const [statisticsError, setStatisticsError] = useState('');
    const [statisticsRetry, setStatisticsRetry] = useState(0);

    useEffect(() => {
        let active = true;
        setStatistics(null);
        setStatisticsLoading(true);
        setStatisticsError('');
        void axios.get<ReportStatistics>(`${BACKEND_URL}/api/report/reportStatistics`, {
            headers: getAuthHeaders(),
            params: statusFilter === 'ALL' ? {} : { status: statusFilter }
        }).then(response => {
            if (active) setStatistics(response.data);
        }).catch(() => {
            if (active) setStatisticsError('신고 통계를 불러오지 못했습니다.');
        }).finally(() => {
            if (active) setStatisticsLoading(false);
        });
        return () => { active = false; };
    }, [statusFilter, getAuthHeaders, statisticsRetry]);

    // =========================
    // 신고 목록 조회
    // =========================
    useEffect(() => {
        let active = true;

        const fetchReportList = async () => {
            setLoading(true);
            setErrorMessage('');

            try {
                const params: { cPage: number; searchType?: string; searchValue?: string } = {
                    cPage: currentPage
                };

                if (statusFilter !== 'ALL') {
                    params.searchType = '3';
                    params.searchValue = statusFilter;
                }

                const response = await axios.get<ReportListResponse>(
                    `${BACKEND_URL}/api/report/reportList`,
                    { headers: getAuthHeaders(), params }
                );

                if (!active) return;

                const result = response.data;
                setReportList(result.data ?? []);
                setTotalItems(result.totalItems ?? 0);
                setTotalPages(result.totalPages ?? 0);
                setStartPage(result.startPage ?? 1);
                setEndPage(result.endPage ?? 1);

                if (result.currentPage && result.currentPage !== currentPage) {
                    setCurrentPage(result.currentPage);
                }
            } catch (error) {
                if (!active) return;

                console.error('신고 목록 조회 실패:', error);
                setReportList([]);
                setTotalItems(0);
                setTotalPages(0);
                setStartPage(1);
                setEndPage(1);
                setErrorMessage('신고 목록을 불러오지 못했습니다.');
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchReportList();

        return () => {
            active = false;
        };
    }, [currentPage, statusFilter, getAuthHeaders]);

    // =========================
    // 신고 유형별 시각화
    // =========================
    const typeChartData = useMemo(() => {
        const counts = new Map<string, number>((statistics?.typeCounts ?? [])
            .map(item => [item.name, item.count] as [string, number]));
        const knownTypes = REPORT_TYPES.map(type => ({ name: REPORT_TYPE_LABELS[type], count: counts.get(type) ?? 0 }));
        const otherCount = (statistics?.typeCounts ?? [])
            .filter(item => !REPORT_TYPES.includes(item.name as ReportType))
            .reduce((sum, item) => sum + item.count, 0);
        return otherCount > 0 ? [...knownTypes, { name: '기타', count: otherCount }] : knownTypes;
    }, [statistics]);

    // =========================
    // 신고 사유별 시각화
    // =========================
    const reasonChartData = statistics?.reasonCounts ?? [];

    // =========================
    // 페이지 변경
    // =========================
    const pageChange = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setCurrentPage(page);
    };

    // =========================
    // 상태 필터
    // =========================
    const statusChange = (status: ReportStatus | 'ALL') => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    // =========================
    // 신고 상태 출력
    // =========================
    const getStatusText = (status: ReportStatus) => {
        switch (status) {
            case 'PENDING': return '접수';
            case 'REVIEWING': return '처리중';
            case 'COMPLETED': return '처리완료';
            case 'REJECTED': return '반려';
            default: return status;
        }
    };

    // =========================
    // 신고 상세 이동
    // =========================
    const handleDetail = (num: number) => {
        navigate(`/admin/reportDetail/${num}`);
    };

    return (
        <div className={styles.reportList}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1>신고 관리</h1>
                    <p>접수된 신고 내역을 조회하고 처리 상태를 확인합니다.</p>
                </div>
            </div>

            {/* 상태 필터 */}
            <div className={styles.filter}>
                <button className={statusFilter === 'ALL' ? styles.activeFilter : ''} onClick={() => statusChange('ALL')}>전체</button>
                <button className={statusFilter === 'PENDING' ? styles.activeFilter : ''} onClick={() => statusChange('PENDING')}>접수</button>
                <button className={statusFilter === 'REVIEWING' ? styles.activeFilter : ''} onClick={() => statusChange('REVIEWING')}>처리중</button>
                <button className={statusFilter === 'COMPLETED' ? styles.activeFilter : ''} onClick={() => statusChange('COMPLETED')}>처리완료</button>
                <button className={statusFilter === 'REJECTED' ? styles.activeFilter : ''} onClick={() => statusChange('REJECTED')}>반려</button>
            </div>

            {/* 시각화 차트 영역 */}
            {statisticsLoading ? <p role="status">신고 전체 통계를 불러오는 중입니다.</p>
                : statisticsError ? <div className={styles.statisticsError} role="alert">
                    <p>{statisticsError}</p>
                    <button type="button" onClick={() => setStatisticsRetry(value => value + 1)}>통계 다시 시도</button>
                </div> : <div className={styles.chartGrid}>
                <div className={styles.chartCard}>
                    <h3>신고 유형별 현황</h3>
                    <p>{statusFilter === 'ALL' ? '전체 상태' : getStatusText(statusFilter)} · 전체 {statistics?.total ?? 0}건 기준</p>
                    <div className={styles.chartCanvas}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeChartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" name="신고 건수" fill="#0d6efd" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3>신고 사유별 비율</h3>
                    <p>{statusFilter === 'ALL' ? '전체 상태' : getStatusText(statusFilter)} · 전체 {statistics?.total ?? 0}건 기준</p>
                    <div className={styles.chartCanvas}>
                        {reasonChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={reasonChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={{ fontSize: 11 }}>
                                        {reasonChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.chartEmpty}>
                                표시할 데이터가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>}

            {/* 신고 수 */}
            <div>전체 신고 {totalItems}건</div>

            {/* 신고 목록 */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>유형</th>
                            <th>신고자</th>
                            <th>신고 대상</th>
                            <th>신고 사유</th>
                            <th>상태</th>
                            <th>신고일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className={styles.empty}>신고 목록을 불러오는 중입니다.</td></tr>
                        ) : errorMessage ? (
                            <tr><td colSpan={7} className={styles.empty}>{errorMessage}</td></tr>
                        ) : reportList.length > 0 ? (
                            reportList.map(report => (
                                <tr key={report.num} onClick={() => handleDetail(report.num)} style={{ cursor: 'pointer' }}>
                                    <td>{report.num}</td>
                                    <td>{REPORT_TYPE_LABELS[report.type]}</td>
                                    <td>{report.member_num}</td>
                                    <td>{report.target_num ?? '-'}</td>
                                    <td>{report.category}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[report.status.toLowerCase()]}`}>
                                            {getStatusText(report.status)}
                                        </span>
                                    </td>
                                    <td>{report.created_date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} className={styles.empty}>신고 데이터가 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 0 && (
                <div className={styles.pagination}>
                    {startPage > 1 && (
                        <button className={styles.pageArrow} onClick={() => pageChange(startPage - 1)}>이전</button>
                    )}

                    {Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, i) => i + startPage).map(page => (
                        <button key={page}
                            className={`${styles.pageButton} ${page === currentPage ? styles.activePage : ''}`}
                            onClick={() => pageChange(page)}>
                            {page}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <button className={styles.pageArrow} onClick={() => pageChange(endPage + 1)}>다음</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportList;
