import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './report.module.css'

type ReportStatus =
    | 'PENDING'
    | 'REVIEWING'
    | 'COMPLETED'
    | 'REJECTED';

type ReportType =
    | 'POST'
    | 'COMMENT'
    | 'USER'
    | 'STUDY';

interface Report {
    id: number;
    type: ReportType;
    reporter: string;
    target: string;
    reason: string;
    status: ReportStatus;
    createdAt: string;
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

    // 한 페이지에 보여줄 신고 수
    const pageSize = 5;

    // 페이지 번호를 몇 개씩 보여줄지
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
    // 페이지 계산
    //
    // 나중에 백엔드에서
    // totalItems
    // totalPages
    // currentPage
    // 등을 받아오면
    // 이 계산 부분은 제거 가능
    // =========================

    useEffect(() => {

        const total =
            filteredReports.length;

        const pages =
            Math.ceil(total / pageSize);

        setTotalItems(total);

        setTotalPages(pages);

        // 필터 변경 등으로
        // 현재 페이지가 존재하지 않게 된 경우
        if (
            pages > 0 &&
            currentPage > pages
        ) {
            setCurrentPage(1);
        }

        // 페이지 그룹 시작 번호
        const start =
            Math.floor(
                (currentPage - 1) /
                pageGroupSize
            ) *
            pageGroupSize +
            1;

        // 페이지 그룹 마지막 번호
        const end =
            Math.min(
                start +
                pageGroupSize -
                1,
                pages
            );

        setStartPage(start);
        setEndPage(end);

    }, [
        filteredReports.length,
        currentPage
    ]);

    // =========================
    // 현재 페이지 데이터
    // =========================

    const startIndex =
        (currentPage - 1) *
        pageSize;

    const endIndex =
        startIndex +
        pageSize;

    const currentReports =
        filteredReports.slice(
            startIndex,
            endIndex
        );

    // =========================
    // 페이지 변경
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

                    <h1>
                        신고 관리
                    </h1>

                    <p>
                        접수된 신고 내역을 조회하고
                        처리 상태를 확인합니다.
                    </p>

                </div>

            </div>

            {/* Status Filter */}
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
                        setStatusFilter(
                            'PENDING'
                        );
                        setCurrentPage(1);
                    }}
                >
                    접수
                </button>

                <button
                    className={
                        statusFilter ===
                        'REVIEWING'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter(
                            'REVIEWING'
                        );
                        setCurrentPage(1);
                    }}
                >
                    처리중
                </button>

                <button
                    className={
                        statusFilter ===
                        'COMPLETED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter(
                            'COMPLETED'
                        );
                        setCurrentPage(1);
                    }}
                >
                    처리완료
                </button>

                <button
                    className={
                        statusFilter ===
                        'REJECTED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter(
                            'REJECTED'
                        );
                        setCurrentPage(1);
                    }}
                >
                    반려
                </button>

            </div>

            {/* 신고 수 */}
            <div>
                전체 신고 {totalItems}건
            </div>

            {/* Report Table */}
            <div
                className={
                    styles.tableWrapper
                }
            >

                <table
                    className={
                        styles.table
                    }
                >

                    <thead>

                        <tr>

                            <th>
                                번호
                            </th>

                            <th>
                                유형
                            </th>

                            <th>
                                신고자
                            </th>

                            <th>
                                신고 대상
                            </th>

                            <th>
                                신고 사유
                            </th>

                            <th>
                                상태
                            </th>

                            <th>
                                신고일
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            currentReports.length >
                            0 ? (

                                currentReports.map(
                                    report => (

                                        <tr
                                            key={
                                                report.id
                                            }
                                            onClick={() =>
                                                handleDetail(
                                                    report.id
                                                )
                                            }
                                        >

                                            <td>
                                                {
                                                    report.id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    getTypeText(
                                                        report.type
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    report.reporter
                                                }
                                            </td>

                                            <td>
                                                {
                                                    report.target
                                                }
                                            </td>

                                            <td>
                                                {
                                                    report.reason
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={`${styles.status} ${
                                                        styles[
                                                            report.status.toLowerCase()
                                                        ]
                                                    }`}
                                                >

                                                    {
                                                        getStatusText(
                                                            report.status
                                                        )
                                                    }

                                                </span>

                                            </td>

                                            <td>
                                                {
                                                    report.createdAt
                                                }
                                            </td>

                                        </tr>

                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className={
                                            styles.empty
                                        }
                                    >
                                        신고 데이터가 없습니다.
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

                    <div
                        className={
                            styles.pagination
                        }
                    >

                        {/* 이전 */}
                        {
                            startPage > 1 && (

                                <button
                                    className={
                                        styles.pageArrow
                                    }
                                    onClick={() =>
                                        pageChange(
                                            startPage -
                                            1
                                        )
                                    }
                                >
                                    이전
                                </button>

                            )
                        }

                        {/* 페이지 번호 */}
                        {
                            Array.from(
                                {
                                    length:
                                        endPage -
                                        startPage +
                                        1
                                },
                                (_, i) =>
                                    i +
                                    startPage
                            ).map(page => (

                                <button
                                    key={page}
                                    className={`${styles.pageButton} ${
                                        page ===
                                        currentPage
                                            ? styles.activePage
                                            : ''
                                    }`}
                                    onClick={() =>
                                        pageChange(
                                            page
                                        )
                                    }
                                >
                                    {page}
                                </button>

                            ))
                        }

                        {/* 다음 */}
                        {
                            endPage <
                                totalPages && (

                                <button
                                    className={
                                        styles.pageArrow
                                    }
                                    onClick={() =>
                                        pageChange(
                                            endPage +
                                            1
                                        )
                                    }
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