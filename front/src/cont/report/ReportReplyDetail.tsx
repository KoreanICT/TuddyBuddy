// 주용현

import axios from 'axios';
import { useAuth } from '../../login/hooks/useAuth';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './report.module.css';

import { ReportType, REPORT_TYPE_LABELS } from './reportTarget';

interface ReportVO {
    num: number;
    member_num: number;
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
    const { token } = useAuth();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    const [report, setReport] = useState<ReportVO | null>(null);
    const [reply, setReply] = useState<ReportReplyVO | null>(null);
    const [loading, setLoading] = useState(true);

    // =========================
    // 신고 정보 + 답변 정보 조회
    // =========================
    useEffect(() => {
        let active = true;

        const fetchReplyDetail = async () => {
            if (!id) {
                setReport(null);
                setReply(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const [reportResponse, replyResponse] = await Promise.all([
                    axios.get<ReportVO>(
                        'http://localhost:80/back/api/report/reportDetail',
                        { headers: getAuthHeaders(), params: { num: id } }
                    ),
                    axios.get<ReportReplyVO>(
                        'http://localhost:80/back/api/report/reportReplyDetail',
                        { headers: getAuthHeaders(), params: { report_num: id } }
                    )
                ]);

                if (!active) return;

                setReport(reportResponse.data);
                setReply(replyResponse.data);

            } catch (error) {
                if (!active) return;

                console.error('신고 답변 상세 조회 실패:', error);
                setReport(null);
                setReply(null);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchReplyDetail();

        return () => {
            active = false;
        };
    }, [id, getAuthHeaders]);

    // =========================
    // 조회 중
    // =========================
    if (loading) {
        return (
            <div className={styles.replyDetail}>
                <div className={styles.notFound}>신고 답변을 불러오는 중입니다.</div>
            </div>
        );
    }

    // =========================
    // 신고 또는 답변이 없는 경우
    // =========================
    if (!report || !reply) {
        return (
            <div className={styles.replyDetail}>
                <div className={styles.notFound}>존재하지 않는 신고 답변입니다.</div>

                <div className={styles.replyDetailActions}>
                    <button className={styles.listButton} onClick={() => navigate('/report/replyList')}>
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
                    <div className={styles.replyDetailValue}>{REPORT_TYPE_LABELS[report.type]}</div>
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

                {/* 관리자 답변 */}
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
                <button className={styles.listButton} onClick={() => navigate('/report/replyList')}>
                    목록
                </button>
            </div>

        </div>
    );
};

export default ReportReplyDetail;
