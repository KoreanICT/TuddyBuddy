
// 주용현, 이주화

import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import styles from './report.module.css';

type ReportStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'REJECTED';
type ReportType = 'POST' | 'COMMENT' | 'USER' | 'STUDY';

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

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d', '#6610f2', '#fd7e14'];

const ReportList: React.FC = () => {
    const navigate = useNavigate();

    const [reportList, setReportList] = useState<ReportVO[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
                    'http://localhost:80/back/api/report/reportList',
                    { params }
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
    }, [currentPage, statusFilter]);

    // =========================
    // 신고 유형별 시각화
    // =========================
    const typeChartData = useMemo(() => {
        const counts: Record<ReportType, number> = {
            POST: 0,
            COMMENT: 0,
            USER: 0,
            STUDY: 0
        };

        reportList.forEach(report => {
            if (report.type in counts) counts[report.type]++;
        });

        return [
            { name: '게시글', count: counts.POST },
            { name: '댓글', count: counts.COMMENT },
            { name: '회원', count: counts.USER },
            { name: '스터디', count: counts.STUDY }
        ];
    }, [reportList]);

    // =========================
    // 신고 사유별 시각화
    // =========================
    const reasonChartData = useMemo(() => {
        const counts: Record<string, number> = {};

        reportList.forEach(report => {
            const reason = report.category || '기타';
            counts[reason] = (counts[reason] || 0) + 1;
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [reportList]);

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
    // 신고 유형 출력
    // =========================
    const getTypeText = (type: ReportType) => {
        switch (type) {
            case 'POST': return '게시글';
            case 'COMMENT': return '댓글';
            case 'USER': return '회원';
            case 'STUDY': return '스터디';
            default: return type;
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
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>📊 신고 유형별 현황</h3>
                    <p style={{ fontSize: '12px', color: '#777', marginBottom: '15px' }}>현재 페이지 기준</p>
                    <div style={{ width: '100%', height: '220px' }}>
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

                <div style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>🥧 신고 사유별 비율</h3>
                    <p style={{ fontSize: '12px', color: '#777', marginBottom: '15px' }}>현재 페이지 기준</p>
                    <div style={{ width: '100%', height: '220px' }}>
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
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>
                                표시할 데이터가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                    <td>{getTypeText(report.type)}</td>
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
