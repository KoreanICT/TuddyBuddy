// 주용현

import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './report.module.css';
import { useAuth } from '../../../login/hooks/useAuth';

import { ReportType, REPORT_TYPE_LABELS } from '../../report/reportTarget';
import ReportTargetPreview from './ReportTargetPreview';

type ReportStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'REJECTED';

const canApplyStatus = (current: ReportStatus, next: ReportStatus) =>
    current === next || current === 'PENDING' ||
    (current === 'REVIEWING' && (next === 'COMPLETED' || next === 'REJECTED'));

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

const ReportReply: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [report, setReport] = useState<ReportVO | null>(null);
    const [reply, setReply] = useState('');
    const [sendNotification, setSendNotification] = useState(true);
    const [status, setStatus] = useState<ReportStatus>('COMPLETED');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasReply, setHasReply] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [revision, setRevision] = useState(0);
    const mutationRef = useRef(false);

    const { memberNum, token } = useAuth();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    // 신고 상세 조회
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
                setLoadError('');
                setReport(null);
                setHasReply(false);
                setReply('');
                setStatus('COMPLETED');

                const [response, replyResponse] = await Promise.all([axios.get<ReportVO>(
                    'http://localhost:80/back/api/report/reportDetail',
                    { headers: getAuthHeaders(), params: { num: id } }
                ), axios.get<{ num: number } | null>(
                    'http://localhost:80/back/api/report/reportReplyDetail',
                    { headers: getAuthHeaders(), params: { report_num: id } }
                )]);

                if (!active) return;
                setReport(response.data);
                setHasReply(Boolean(replyResponse.data?.num));
                if (response.data.status === 'COMPLETED' || response.data.status === 'REJECTED') {
                    setStatus(response.data.status);
                }

            } catch (error) {
                if (!active) return;

                console.error('신고 상세 조회 실패:', error);
                setReport(null);
                setLoadError('신고 또는 기존 답변을 불러오지 못했습니다. 다시 시도해주세요.');
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchReportDetail();

        return () => {
            active = false;
        };
    }, [id, getAuthHeaders, revision]);

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
        if (!report || mutationRef.current || hasReply) return;

        if (!token || memberNum == null) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!canApplyStatus(report.status, status)) {
            alert('현재 신고 상태에서 선택한 상태로 변경할 수 없습니다.');
            return;
        }

        if (!reply.trim()) {
            alert('답변 내용을 입력해주세요.');
            return;
        }

        mutationRef.current = true;
        try {
            setSubmitting(true);

            // 답변 등록
            const replyFormData = new FormData();
            replyFormData.append('content', reply.trim());
            replyFormData.append('report_num', String(report.num));

            replyFormData.append('status', status);

            await axios.post(
                'http://localhost:80/back/api/report/reportReplyAdd',
                replyFormData,
                { headers: getAuthHeaders() }
            );

            // TODO: 알림 기능 구현 후 연결
            if (sendNotification) {
                console.log('신고자 알림 기능 연동 예정');
            }

            alert('신고 답변이 등록되었습니다.');
            navigate(`/admin/reportDetail/${report.num}`);

        } catch (error) {
            console.error('신고 답변 등록 실패:', error);
            const message = axios.isAxiosError(error) && typeof error.response?.data === 'string'
                ? error.response.data : '신고 답변 등록 중 오류가 발생했습니다.';
            alert(message);
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setRevision(value => value + 1);
            }
        } finally {
            mutationRef.current = false;
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
                <div className={styles.notFound} role="alert">{loadError || '존재하지 않는 신고 내역입니다.'}</div>
                <button type="button" onClick={() => setRevision(value => value + 1)}>다시 시도</button>
                <div className={styles.actions}>
                    <button className={styles.listButton} onClick={() => navigate('/admin/reportList')}>
                        목록
                    </button>
                </div>
            </div>
        );
    }

    if (hasReply) return (
        <div className={styles.reportReply}>
            <h1>이미 답변이 등록된 신고입니다.</h1>
            <p>상세 화면에서 기존 답변을 확인하고 수정하거나 삭제할 수 있습니다.</p>
            <button type="button" className={styles.listButton}
                onClick={() => navigate(`/admin/reportDetail/${report.num}`)}>신고 상세로 돌아가기</button>
        </div>
    );

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
                    <div className={styles.value}>{REPORT_TYPE_LABELS[report.type]}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고자</div>
                    <div className={styles.value}>{report.member_num}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고 사유</div>
                    <div className={styles.value}>{report.category}</div>
                </div>
                <div className={styles.detailRow}>
                    <div className={styles.label}>신고 대상 번호</div>
                    <div className={styles.value}>{report.target_num}</div>
                </div>
                <div className={styles.detailContent}>
                    <div className={styles.label}>신고 내용</div>
                    <div className={styles.contentBox}>{report.content}</div>
                </div>
            </div>

            <ReportTargetPreview reportNum={report.num} type={report.type} targetNum={report.target_num} />

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
                        <option value="REVIEWING" disabled={!canApplyStatus(report.status, 'REVIEWING')}>처리중</option>
                        <option value="COMPLETED" disabled={!canApplyStatus(report.status, 'COMPLETED')}>처리완료</option>
                        <option value="REJECTED" disabled={!canApplyStatus(report.status, 'REJECTED')}>반려</option>
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
