import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './report.module.css';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

type ReportStatus =
    | 'PENDING'
    | 'REVIEWING'
    | 'COMPLETED'
    | 'REJECTED';

type ReportStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'REJECTED';
type ReportType = 'POST' | 'COMMENT' | 'USER' | 'STUDY';

interface ReportVO {
    num: number;
    member_num: number;
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

const ReportList: React.FC = () => {
    const navigate = useNavigate();

    // =========================
    // 신고 데이터
    // =========================

    const [reports] = useState<Report[]>([
        {
            id: 1,
            type: 'POST',
            reporter: 'user01',
            target: '게시글 #15',
            reason: '욕설 및 비방',
            status: 'PENDING',
            createdAt: '2026-09-07',
        },
        {
            id: 2,
            type: 'COMMENT',
            reporter: 'user02',
            target: '댓글 #32',
            reason: '도배성 댓글',
            status: 'REVIEWING',
            createdAt: '2026-09-06',
        },
        {
            id: 3,
            type: 'USER',
            reporter: 'user03',
            target: 'user09',
            reason: '부적절한 행동',
            status: 'COMPLETED',
            createdAt: '2026-09-05',
        },
        {
            id: 4,
            type: 'STUDY',
            reporter: 'user04',
            target: 'React 스터디',
            reason: '광고성 스터디',
            status: 'REJECTED',
            createdAt: '2026-09-04',
        },
        {
            id: 5,
            type: 'POST',
            reporter: 'user05',
            target: '게시글 #21',
            reason: '욕설 및 비방',
            status: 'PENDING',
            createdAt: '2026-09-03',
        },
        {
            id: 6,
            type: 'COMMENT',
            reporter: 'user06',
            target: '댓글 #45',
            reason: '도배성 댓글',
            status: 'PENDING',
            createdAt: '2026-09-02',
        },
        {
            id: 7,
            type: 'USER',
            reporter: 'user07',
            target: 'user15',
            reason: '괴롭힘',
            status: 'REVIEWING',
            createdAt: '2026-09-01',
        },
        {
            id: 8,
            type: 'POST',
            reporter: 'user08',
            target: '게시글 #30',
            reason: '광고성 게시글',
            status: 'COMPLETED',
            createdAt: '2026-08-31',
        },
        {
            id: 9,
            type: 'STUDY',
            reporter: 'user09',
            target: 'Java 스터디',
            reason: '부적절한 스터디',
            status: 'PENDING',
            createdAt: '2026-08-30',
        },
        {
            id: 10,
            type: 'USER',
            reporter: 'user10',
            target: 'user22',
            reason: '욕설 및 비방',
            status: 'REJECTED',
            createdAt: '2026-08-29',
        },
        {
            id: 11,
            type: 'COMMENT',
            reporter: 'user11',
            target: '댓글 #51',
            reason: '욕설',
            status: 'COMPLETED',
            createdAt: '2026-08-28',
        },
        {
            id: 12,
            type: 'POST',
            reporter: 'user12',
            target: '게시글 #40',
            reason: '허위 정보',
            status: 'PENDING',
            createdAt: '2026-08-27',
        },
        {
            id: 13,
            type: 'USER',
            reporter: 'user13',
            target: 'user30',
            reason: '부적절한 행동',
            status: 'REVIEWING',
            createdAt: '2026-08-26',
        },
    ]);

    // =========================
    // 상태 필터
    // =========================

    const [statusFilter, setStatusFilter] =
        useState<ReportStatus | 'ALL'>('ALL');

    // =========================
    // 페이지네이션
    // =========================

    const pageSize = 5;
    const pageGroupSize = 5;

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [currentPage, setCurrentPage] =
        useState(1);

    const [startPage, setStartPage] =
        useState(1);

    const [endPage, setEndPage] =
        useState(1);

    // =========================
    // 상태 필터
    // =========================

    const filteredReports = reports.filter(report => {
        const matchStatus =
            statusFilter === 'ALL' ||
            report.status === statusFilter;

        return matchStatus;
    });

    // =========================
    // 시각화 데이터 가공 (필터링된 데이터 기준)
    // =========================

    const typeChartData = useMemo(() => {
        const typeMap: Record<ReportType, string> = {
            POST: '게시글',
            COMMENT: '댓글',
            USER: '회원',
            STUDY: '스터디',
        };

        const counts: Record<string, number> = { 게시글: 0, 댓글: 0, 회원: 0, 스터디: 0 };
        filteredReports.forEach((r) => {
            const koreanType = typeMap[r.type];
            if (koreanType) {
                counts[koreanType] = (counts[koreanType] || 0) + 1;
            }
        });

        return Object.keys(counts).map((key) => ({
            name: key,
            count: counts[key],
        }));
    }, [filteredReports]);

    const reasonChartData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredReports.forEach((r) => {
            counts[r.reason] = (counts[r.reason] || 0) + 1;
        });

        return Object.keys(counts).map((key) => ({
            name: key,
            value: counts[key],
        }));
    }, [filteredReports]);

    const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d', '#6610f2', '#fd7e14'];

    // =========================
    // 페이지 계산
    // =========================

    useEffect(() => {
        const total = filteredReports.length;
        const pages = Math.ceil(total / pageSize);

        setTotalItems(total);
        setTotalPages(pages);

        if (
            pages > 0 &&
            currentPage > pages
        ) {
            setCurrentPage(1);
        }

        const start =
            Math.floor(
                (currentPage - 1) /
                pageGroupSize
            ) *
            pageGroupSize +
            1;

        const end =
            Math.min(
                start +
                pageGroupSize -
                1,
                pages
            );

        fetchReportList();

        return () => {
            active = false;
        };
    }, [currentPage, statusFilter]);

    // =========================
    // 페이지 변경
    // =========================
    const pageChange = (page: number) => {
        setCurrentPage(page);
    };

    // =========================
    // 상태 필터
    // =========================

    const pageChange = (
        page: number
    ) => {
        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);
    };

    // =========================
    // 신고 상태 출력
    // =========================

    const getStatusText = (
        status: ReportStatus
    ) => {
        switch (status) {
            case 'PENDING':
                return '접수';

            case 'REVIEWING':
                return '처리중';

            case 'COMPLETED':
                return '처리완료';

            case 'REJECTED':
                return '반려';
        }
    };

    // =========================
    // 신고 유형 출력
    // =========================

    const getTypeText = (
        type: ReportType
    ) => {
        switch (type) {
            case 'POST':
                return '게시글';

            case 'COMMENT':
                return '댓글';

            case 'USER':
                return '회원';

            case 'STUDY':
                return '스터디';
        }
    };

    // =========================
    // 신고 상세 이동
    // =========================

    const handleDetail = (
        id: number
    ) => {
        navigate(
            `/admin/reportDetail/${id}`
        );
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

            {/* Status Filter (<결과> 카테고리 제거됨) */}
            <div className={styles.filter}>
                <button
                    className={
                        statusFilter === 'ALL'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter('ALL');
                        setCurrentPage(1);
                    }}
                >
                    전체
                </button>

                <button
                    className={
                        statusFilter === 'PENDING'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter('PENDING');
                        setCurrentPage(1);
                    }}
                >
                    접수
                </button>

                <button
                    className={
                        statusFilter === 'REVIEWING'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter('REVIEWING');
                        setCurrentPage(1);
                    }}
                >
                    처리중
                </button>

                <button
                    className={
                        statusFilter === 'COMPLETED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter('COMPLETED');
                        setCurrentPage(1);
                    }}
                >
                    처리완료
                </button>

                <button
                    className={
                        statusFilter === 'REJECTED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter('REJECTED');
                        setCurrentPage(1);
                    }}
                >
                    반려
                </button>
            </div>

            {/* ========================= */}
            {/* 시각화 차트 영역 */}
            {/* ========================= */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>📊 신고 유형별 현황</h3>
                    <div style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer>
                            <BarChart data={typeChartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#0d6efd" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>🥧 신고 사유별 비율</h3>
                    <div style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={reasonChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={75}
                                    label={{ fontSize: 11 }}
                                >
                                    {reasonChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 신고 수 */}
            <div>
                전체 신고 {totalItems}건
            </div>

            {/* Report Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <tbody>
                        {
                            currentReports.length > 0 ? (
                                currentReports.map(report => (
                                    <tr
                                        key={report.id}
                                        onClick={() => handleDetail(report.id)}
                                    >
                                        <td>{report.id}</td>
                                        <td>{getTypeText(report.type)}</td>
                                        <td>{report.reporter}</td>
                                        <td>{report.target}</td>
                                        <td>{report.reason}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[report.status.toLowerCase()]}`}>
                                                {getStatusText(report.status)}
                                            </span>
                                        </td>
                                        <td>{report.createdAt}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                                        조회된 신고 내역이 없습니다.
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {
                totalPages > 0 && (
                    <div className={styles.pagination}>
                        {
                            startPage > 1 && (
                                <button
                                    className={styles.pageArrow}
                                    onClick={() => pageChange(startPage - 1)}
                                >
                                    이전
                                </button>
                            )
                        }

                        {
                            Array.from(
                                { length: endPage - startPage + 1 },
                                (_, i) => i + startPage
                            ).map(page => (
                                <button
                                    key={page}
                                    className={`${styles.pageButton} ${
                                        page === currentPage ? styles.activePage : ''
                                    }`}
                                    onClick={() => pageChange(page)}
                                >
                                    {page}
                                </button>
                            ))
                        }

                        {
                            endPage < totalPages && (
                                <button
                                    className={styles.pageArrow}
                                    onClick={() => pageChange(endPage + 1)}
                                >
                                    다음
                                </button>
                            )
                        }
                    </div>
                )
            }

        </div>
    );
};

export default ReportList;
