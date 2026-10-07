import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './report.module.css';

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

interface ReportVO {
    num: number;
    member_num: number;
    target_num: number;
    type: ReportType;
    category: string;
    content: string;
    status: ReportStatus;
    created_date: string;
}

const ReportList: React.FC = () => {

    const navigate = useNavigate();

    const [reportList, setReportList] = useState<ReportVO[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    const [statusFilter, setStatusFilter] =
        useState<ReportStatus | 'ALL'>('ALL');

    const fetchReportList = async (page: number) => {

        try {

            const urls = "http://localhost:80/back/api/report/reportList" // '/back/api/report/reportList' 

            const params: any = {cPage: page};

            // 전체가 아닐 경우 상태 검색
            if (statusFilter !== 'ALL') {
                params.searchType = '3';
                params.searchValue = statusFilter;
            }

            const response = await axios.get(
                urls,
                {
                    params: params
                }
            );

            setReportList(response.data.data);
            setTotalItems(response.data.totalItems);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
            setStartPage(response.data.startPage);
            setEndPage(response.data.endPage);

        } catch (error) {

            console.error(
                '신고 목록 조회 실패:',
                error
            );
        }
    };

    useEffect(() => {
        fetchReportList(currentPage);
    }, [currentPage]);

    const pageChange = (
        page: number
    ) => {

        setCurrentPage(page);
    };

    // 상태 필터

    const statusChange = (
        status: ReportStatus | 'ALL'
    ) => {
        setStatusFilter(status);
        // 변경 시 1페이지부터 조회
        setCurrentPage(1);

        // 이미 1페이지라면
        // currentPage 값이 변하지 않으므로 직접 조회
        if (currentPage === 1) {

            setTimeout(() => {
                fetchReportList(1);
            }, 0);
        }
    };

    // 신고 상태 출력

    const getStatusText = (status: ReportStatus)=> {

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

    // 신고 상세 이동

    const handleDetail = (num: number) => {
        navigate(
            `/admin/reportDetail/${num}`
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

            {/* 상태 */}
            <div className={styles.filter}>
                <button
                    className={statusFilter === 'ALL' ? styles.activeFilter : ''}
                    onClick={() => statusChange('ALL')}
                >
                    전체
                </button>

                <button className={statusFilter === 'PENDING' ? styles.activeFilter : ''}
                    onClick={() => statusChange('PENDING')}>
                    접수
                </button>

                <button
                    className={
                        statusFilter === 'REVIEWING'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() =>
                        statusChange('REVIEWING')
                    }
                >
                    처리중
                </button>

                <button
                    className={
                        statusFilter === 'COMPLETED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() =>
                        statusChange('COMPLETED')
                    }
                >
                    처리완료
                </button>

                <button
                    className={
                        statusFilter === 'REJECTED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() =>
                        statusChange('REJECTED')
                    }
                >
                    반려
                </button>

            </div>
            {/* 신고 수 */}
            <div>
                전체 신고 {totalItems}건
            </div>

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
                        {
                            reportList.length > 0 ? (
                                reportList.map(
                                    report => (
                                        <tr key={report.num} onClick={() => handleDetail(report.num)}>
                                            <td>{report.num}</td>
                                            <td>{getTypeText(report.type)}</td>
                                            <td>{report.member_num}</td>
                                            <td>{report.target_num}</td>
                                            <td>{report.category}</td>

                                            <td>
                                                <span className={`${styles.status} ${styles[report.status.toLowerCase()]}`}>
                                                    {getStatusText(report.status)}
                                                </span>
                                            </td>
                                            <td>
                                                {report.created_date}
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td colSpan={7} className={styles.empty}>
                                        신고 데이터가 없습니다.
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {
                totalPages > 0 && (
                    <div className={styles.pagination}>
                        {startPage > 1 && (
                                <button className={styles.pageArrow} onClick={() => {pageChange(startPage - 1)}}>
                                    이전
                                </button>
                            )}
                        {
                            Array.from(
                                {length: endPage - startPage + 1},
                                (xx, i) => i + startPage)
                                .map(
                                    page => (
                                        <button key={page}
                                            className={`${styles.pageButton} ${page === currentPage ? styles.activePage : ''}`}
                                            onClick={() => {pageChange(page)}}>{page}</button>))}
                        {
                            endPage < totalPages && (
                                <button className={styles.pageArrow} onClick={() => {pageChange(endPage + 1)}}>
                                    다음
                                </button>
                            )}
                    </div>
                )}
        </div>
    );
};

export default ReportList;