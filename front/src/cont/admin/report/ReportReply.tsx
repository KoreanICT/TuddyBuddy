// 주용현

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './report.module.css';

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

const ReportReply: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [report, setReport] = useState<ReportVO | null>(null);
    const [reply, setReply] = useState('');
    const [sendNotification, setSendNotification] = useState(true);
    const [status, setStatus] = useState<ReportStatus>('COMPLETED');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // =========================
    // 신고 상세 조회
    // =========================
    useEffect(() => {
        let active = true;

        const fetchReportDetail = async () => {
            if (!id) {
                setReport(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const response = await axios.get<ReportVO>(
                    'http://localhost:80/back/api/report/reportDetail',
                    { params: { num: id } }
                );

                if (!active) return;
                setReport(response.data);

            } catch (error) {
                if (!active) return;

                console.error('신고 상세 조회 실패:', error);
                setReport(null);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchReportDetail();

        return () => {
            active = false;
        };
    }, [id]);

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
    // 답변 등록
    // =========================
    const handleSubmit = async () => {
        if (!report || submitting) return;

        if (!reply.trim()) {
            alert('답변 내용을 입력해주세요.');
            return;
        }

        try {
            setSubmitting(true);

            // 답변 등록
            const replyFormData = new FormData();
            replyFormData.append('content', reply.trim());
            replyFormData.append('report_num', String(report.num));

            // TODO: 로그인 연결 후 실제 관리자 번호 사용
            replyFormData.append('admin_num', '1');

            await axios.post(
                'http://localhost:80/back/api/report/reportReplyAdd',
                replyFormData
            );

            // 신고 상태 변경
            const statusFormData = new FormData();
            statusFormData.append('num', String(report.num));
            statusFormData.append('status', status);

            const response = await axios.put<number>(
                'http://localhost:80/back/api/report/reportStatusUpdate',
                statusFormData
            );

            if (response.data < 1) {
                throw new Error('신고 상태가 변경되지 않았습니다.');
            }

            // TODO: 알림 기능 구현 후 연결
            if (sendNotification) {
                console.log('신고자 알림 기능 연동 예정');
            }

            alert('신고 답변이 등록되었습니다.');
            navigate(`/admin/reportDetail/${report.num}`);

        } catch (error) {
            console.error('신고 답변 등록 실패:', error);
            alert('신고 답변 등록 또는 상태 변경 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // 조회 중
    // =========================
    if (loading) {
        return (
            <div className={styles.reportReply}>
                <div className={styles.header}>
                    <h1>신고 답변</h1>
                </div>
                <div className={styles.notFound}>신고 내역을 불러오는 중입니다.</div>
            </div>
        );
    }

    // =========================
    // 신고 데이터 없는 경우
    // =========================
    if (!report) {
        return (
            <div className={styles.reportReply}>
                <div className={styles.header}>
                    <h1>신고 답변</h1>
                </div>
                <div className={styles.notFound}>존재하지 않는 신고 내역입니다.</div>
                <div className={styles.actions}>
                    <button className={styles.listButton} onClick={() => navigate('/admin/reportList')}>
                        목록
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.reportReply}>

            {/* Header */}
            <div className={styles.header}>
                <h1>신고 답변</h1>
                <p>신고 내용을 확인하고 처리 결과를 작성합니다.</p>
            </div>

            {/* 신고 정보 */}
            <div className={styles.replyInfo}>
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
                    <div className={styles.label}>신고 사유</div>
                    <div className={styles.value}>{report.category}</div>
                </div>
            </div>

            {/* 답변 작성 */}
            <div className={styles.replyCard}>
                <div className={styles.replySection}>
                    <label className={styles.replyLabel}>관리자 답변</label>
                    <textarea
                        className={styles.replyTextarea}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="신고 처리 결과를 입력해주세요."
                        rows={10}
                        disabled={submitting}
                    />
                </div>

                {/* 처리 상태 */}
                <div className={styles.replyOption}>
                    <div className={styles.optionLabel}>처리 상태</div>
                    <select
                        className={styles.select}
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ReportStatus)}
                        disabled={submitting}
                    >
                        <option value="REVIEWING">처리중</option>
                        <option value="COMPLETED">처리완료</option>
                        <option value="REJECTED">반려</option>
                    </select>

                    <span className={styles.statusDescription}>
                        답변 등록 후 상태: {getStatusText(status)}
                    </span>
                </div>

                {/* 알림 */}
                <div className={styles.notificationArea}>
                    <label className={styles.notificationLabel}>
                        <input
                            type="checkbox"
                            checked={sendNotification}
                            onChange={(e) => setSendNotification(e.target.checked)}
                            disabled={submitting}
                        />
                        신고자에게 처리 결과 알림 보내기 (구현 예정)
                    </label>
                    <p>현재 알림 기능은 연결되지 않았으며, 답변만 등록됩니다.</p>
                </div>
            </div>

            {/* Buttons */}
            <div className={styles.actions}>
                <button className={styles.listButton} onClick={() => navigate(`/admin/reportDetail/${report.num}`)} disabled={submitting}>
                    취소
                </button>

                <button className={styles.replyButton} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? '등록 중...' : '답변 등록'}
                </button>
            </div>
        </div>
    );
};

export default ReportReply;