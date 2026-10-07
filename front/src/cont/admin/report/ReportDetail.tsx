import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const ReportDetail: React.FC = () => {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [report, setReport] = useState<ReportVO | null>(null);
    const [status, setStatus] = useState<ReportStatus>('PENDING');
    const [loading, setLoading] = useState(true);

    // 신고 상세 조회
    const fetchReportDetail = async () => {
        try {
            const urls = "http://localhost:80/back/api/report/reportDetail";

            const response = await axios.get(urls, {
                params: {
                    num: id
                }
            });

            setReport(response.data);
            setStatus(response.data.status);

        } catch (error) {
            console.error('신고 상세 조회 실패:', error);
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportDetail();
    }, [id]);

    // 신고 상태 출력
    const getStatusText = (status: ReportStatus) => {
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

    // 신고 유형 출력
    const getTypeText = (type: ReportType) => {
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

    // 상태 적용
    const handleApply = async () => {
        if (!report) {
            return;
        }

        try {
            const formData = new FormData();

            formData.append('num', String(report.num));
            formData.append('status', status);

            const urls = "http://localhost:80/back/api/report/reportStatusUpdate";

            const response = await axios.put(urls, formData);

            console.log('신고 상태 수정:', response.data);

            alert(`신고 상태가 "${getStatusText(status)}" 상태로 변경되었습니다.`);

            // 수정된 데이터 다시 조회
            fetchReportDetail();

        } catch (error) {
            console.error('신고 상태 수정 실패:', error);
            alert('신고 상태 수정 중 오류가 발생했습니다.');
        }
    };

    // 상세 조회 중
    if (loading) {
        return (
            <div className={styles.reportDetail}>
                <div className={styles.header}>
                    <h1>신고 내역 상세</h1>
                </div>

                <div className={styles.notFound}>
                    신고 내역을 불러오는 중입니다.
                </div>
            </div>
        );
    }

    // 신고 데이터 없는 경우
    if (!report) {
        return (
            <div className={styles.reportDetail}>
                <div className={styles.header}>
                    <h1>신고 내역 상세</h1>
                </div>

                <div className={styles.notFound}>
                    존재하지 않는 신고 내역입니다.
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.listButton}
                        onClick={() => navigate('/admin/reportList')}
                    >
                        목록
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.reportDetail}>

            {/* Header */}
            <div className={styles.header}>
                <h1>신고 내역 상세</h1>
                <p>신고 정보를 확인하고 처리 상태를 관리합니다.</p>
            </div>

            {/* Detail Card */}
            <div className={styles.detailCard}>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고 번호</div>
                    <div className={styles.value}>{report.num}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고 유형</div>
                    <div className={styles.value}>{getTypeText(report.type)}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고자</div>
                    <div className={styles.value}>{report.member_num}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고 대상</div>
                    <div className={styles.value}>{report.target_num}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고 사유</div>
                    <div className={styles.value}>{report.category}</div>
                </div>

                <div className={styles.detailContent}>
                    <div className={styles.label}>신고 내용</div>
                    <div className={styles.contentBox}>{report.content}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고일</div>
                    <div className={styles.value}>{report.created_date}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>처리 상태</div>

                    <div className={styles.statusArea}>
                        <select
                            className={styles.select}
                            value={status}
                            onChange={(e) => setStatus(e.target.value as ReportStatus)}
                        >
                            <option value="PENDING">접수</option>
                            <option value="REVIEWING">처리중</option>
                            <option value="COMPLETED">처리완료</option>
                            <option value="REJECTED">반려</option>
                        </select>

                        <button
                            className={styles.applyButton}
                            onClick={handleApply}
                        >
                            적용
                        </button>
                    </div>
                </div>

            </div>

            {/* Buttons */}
            <div className={styles.actions}>
                <button
                    className={styles.listButton}
                    onClick={() => navigate('/admin/reportList')}
                >
                    목록
                </button>

                <button
                    className={styles.replyButton}
                    onClick={() => navigate(`/admin/reportReply/${report.num}`)}
                >
                    답변 작성
                </button>
            </div>

        </div>
    );
};

export default ReportDetail;