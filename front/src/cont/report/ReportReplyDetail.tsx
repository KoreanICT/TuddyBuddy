import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './report.module.css';

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
    status: string;
    created_date: string;
}

interface ReportReplyVO {
    num: number;
    content: string;
    created_date: string;
    report_num: number;
    admin_num: number;
}

const ReportReplyDetail: React.FC = () => {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [report, setReport] = useState<ReportVO | null>(null);
    const [reply, setReply] = useState<ReportReplyVO | null>(null);
    const [loading, setLoading] = useState(true);

    // 신고 정보 + 답변 정보 조회
    const fetchReplyDetail = async () => {
        try {
            const reportUrl = "http://localhost:80/back/api/report/reportDetail"; // '/back/api/report/reportDetail'
            const replyUrl = "http://localhost:80/back/api/report/reportReplyDetail"; // '/back/api/report/reportReplyDetail'

            const reportResponse = await axios.get(reportUrl, {
                params: { num: id }
            });

            const replyResponse = await axios.get(replyUrl, {
                params: { report_num: id }
            });

            setReport(reportResponse.data);
            setReply(replyResponse.data);

        } catch (error) {
            console.error('신고 답변 상세 조회 실패:', error);
            setReport(null);
            setReply(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReplyDetail();
    }, [id]);

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

    if (loading) {
        return (
            <div className={styles.replyDetail}>
                <div className={styles.notFound}>
                    신고 답변을 불러오는 중입니다.
                </div>
            </div>
        );
    }

    if (!report || !reply) {
        return (
            <div className={styles.replyDetail}>
                <div className={styles.notFound}>
                    존재하지 않는 신고 답변입니다.
                </div>

                <div className={styles.replyDetailActions}>
                    <button
                        className={styles.listButton}
                        onClick={() => navigate('/report/replyList')}
                    >
                        목록
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.replyDetail}>

            {/* Header */}
            <div className={styles.replyDetailHeader}>
                <h1>신고 답변 상세</h1>
                <p>신고 내용과 관리자의 처리 답변을 확인합니다.</p>
            </div>

            {/* 신고 및 답변 정보 */}
            <div className={styles.replyDetailCard}>

                <div className={styles.replyDetailRow}>
                    <div className={styles.replyDetailLabel}>신고 번호</div>
                    <div className={styles.replyDetailValue}>{report.num}</div>
                </div>

                <div className={styles.replyDetailRow}>
                    <div className={styles.replyDetailLabel}>신고 종류</div>
                    <div className={styles.replyDetailValue}>{getTypeText(report.type)}</div>
                </div>

                <div className={styles.replyDetailRow}>
                    <div className={styles.replyDetailLabel}>신고 대상</div>
                    <div className={styles.replyDetailValue}>{report.target_num}</div>
                </div>

                <div className={styles.replyDetailRow}>
                    <div className={styles.replyDetailLabel}>신고 사유</div>
                    <div className={styles.replyDetailValue}>{report.category}</div>
                </div>

                <div className={styles.replyDetailRow}>
                    <div className={styles.replyDetailLabel}>신고일</div>
                    <div className={styles.replyDetailValue}>{report.created_date}</div>
                </div>

                <div className={styles.replyDetailContent}>
                    <div className={styles.replyDetailLabel}>신고 내용</div>
                    <div className={styles.replyContentBox}>{report.content}</div>
                </div>

                <div className={styles.replyDivider}>
                    신고 처리 답변
                </div>

                <div className={styles.replyDetailRow}>
                    <div className={styles.replyDetailLabel}>답변 번호</div>
                    <div className={styles.replyDetailValue}>{reply.num}</div>
                </div>

                <div className={styles.replyDetailRow}>
                    <div className={styles.replyDetailLabel}>답변일</div>
                    <div className={styles.replyDetailValue}>{reply.created_date}</div>
                </div>

                <div className={styles.replyDetailContent}>
                    <div className={styles.replyDetailLabel}>관리자 답변</div>
                    <div className={styles.replyContentBox}>{reply.content}</div>
                </div>

            </div>

            {/* Buttons */}
            <div className={styles.replyDetailActions}>
                <button
                    className={styles.listButton}
                    onClick={() => navigate('/report/replyList')}
                >
                    목록
                </button>
            </div>

        </div>
    );
};

export default ReportReplyDetail;