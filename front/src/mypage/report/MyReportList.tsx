// 주용현

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './myReportList.module.css';

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

const MyReportList: React.FC = () => {
    const navigate = useNavigate();

    const [reportList, setReportList] = useState<ReportVO[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // TODO: 로그인 연동 후 실제 회원 번호로 변경
    const memberNum = 1;

    // =========================
    // 나의 신고 목록 조회
    // =========================
    useEffect(() => {
        let active = true;

        const fetchMyReportList = async () => {
            try {
                setLoading(true);

                const response = await axios.get<ReportListResponse>(
                    'http://localhost:80/back/api/report/myReportList',
                    {
                        params: {
                            member_num: memberNum,
                            cPage: currentPage
                        }
                    }
                );

                if (!active) return;

                setReportList(response.data.data ?? []);
                setTotalItems(response.data.totalItems);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.currentPage);
                setStartPage(response.data.startPage);
                setEndPage(response.data.endPage);

            } catch (error) {
                if (!active) return;

                console.error('나의 신고 목록 조회 실패:', error);
                setReportList([]);
                setTotalItems(0);
                setTotalPages(0);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchMyReportList();

        return () => {
            active = false;
        };
    }, [currentPage, memberNum]);

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
    // 페이지 변경
    // =========================
    const pageChange = (page: number) => {
        setCurrentPage(page);
    };

    // =========================
    // 신고 답변 상세 이동
    // =========================
    const handleDetail = (num: number) => {
        navigate(`/report/replyDetail/${num}`);
    };

    return (
        <div className={styles.container}>

            {/* Header */}
            <div className={styles.header}>
                <h2>나의 신고내역</h2>
                <p>내가 접수한 신고와 처리 진행 상황을 확인할 수 있습니다.</p>
            </div>

            {/* 신고 수 */}
            <div>전체 신고 {totalItems}건</div>

            {/* 신고 목록 */}
            <div className={styles.tableBox}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>신고번호</th>
                            <th>신고유형</th>
                            <th>신고내용</th>
                            <th>처리상태</th>
                            <th>신고일</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className={styles.empty}>
                                    신고 내역을 불러오는 중입니다.
                                </td>
                            </tr>
                        ) : reportList.length > 0 ? (
                            reportList.map(report => (
                                <tr
                                    key={report.num}
                                    onClick={() => handleDetail(report.num)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>{report.num}</td>
                                    <td>{getTypeText(report.type)}</td>
                                    <td>{report.content}</td>
                                    <td>{getStatusText(report.status)}</td>
                                    <td>{report.created_date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.empty}>
                                    신고 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 0 && (
                <div className={styles.pagination}>
                    {startPage > 1 && (
                        <button onClick={() => pageChange(startPage - 1)}>
                            이전
                        </button>
                    )}

                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => i + startPage).map(page => (
                        <button
                            key={page}
                            onClick={() => pageChange(page)}
                            disabled={page === currentPage}
                        >
                            {page}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <button onClick={() => pageChange(endPage + 1)}>
                            다음
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyReportList;