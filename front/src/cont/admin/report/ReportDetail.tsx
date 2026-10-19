// 주용현

import axios from 'axios';
import { useAuth } from '../../../login/hooks/useAuth';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './report.module.css';

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

interface ReportReplyVO {
    num: number;
    content: string;
    admin_num: number;
    created_date: string;
}

const ReportDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    const [report, setReport] = useState<ReportVO | null>(null);
    const [status, setStatus] = useState<ReportStatus>('PENDING');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [reply, setReply] = useState<ReportReplyVO | null>(null);
    const [replyDraft, setReplyDraft] = useState('');
    const [editingReply, setEditingReply] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [revision, setRevision] = useState(0);
    const mutationRef = useRef(false);

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
                setErrorMessage('');
                setReport(null);
                setReply(null);
                setEditingReply(false);

                const [response, replyResponse] = await Promise.all([axios.get<ReportVO>(
                    'http://localhost:80/back/api/report/reportDetail',
                    { headers: getAuthHeaders(), params: { num: id } }
                ), axios.get<ReportReplyVO | null>(
                    'http://localhost:80/back/api/report/reportReplyDetail',
                    { headers: getAuthHeaders(), params: { report_num: id } }
                )]);

                if (!active) return;

                setReport(response.data);
                setStatus(response.data.status);
                setReply(replyResponse.data || null);
                setReplyDraft(replyResponse.data?.content || '');

            } catch (error) {
                if (!active) return;

                console.error('신고 상세 조회 실패:', error);
                setReport(null);
                setErrorMessage('신고 또는 답변을 불러오지 못했습니다. 다시 시도해주세요.');
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
    // 상태 적용
    // =========================
    const handleApply = async () => {
        if (!report || mutationRef.current || report.status === status) return;

        if (!canApplyStatus(report.status, status)) {
            alert('현재 신고 상태에서 선택한 상태로 변경할 수 없습니다.');
            return;
        }

        mutationRef.current = true;
        try {
            setUpdating(true);

            const formData = new FormData();
            formData.append('num', String(report.num));
            formData.append('status', status);

            const response = await axios.put<number>(
                'http://localhost:80/back/api/report/reportStatusUpdate',
                formData,
                { headers: getAuthHeaders() }
            );

            if (typeof response.data !== 'number' || response.data < 1) {
                alert('신고 상태가 변경되지 않았습니다.');
                return;
            }

            alert(`신고 상태가 "${getStatusText(status)}" 상태로 변경되었습니다.`);

            // 수정된 상태를 화면에 반영
            setReport(prev => prev ? { ...prev, status } : null);

        } catch (error) {
            console.error('신고 상태 수정 실패:', error);
            const message = axios.isAxiosError(error) && typeof error.response?.data === 'string'
                ? error.response.data : '신고 상태 수정 중 오류가 발생했습니다.';
            alert(message);
            if (axios.isAxiosError(error) && [404, 409].includes(error.response?.status || 0)) {
                setRevision(value => value + 1);
            }
        } finally {
            mutationRef.current = false;
            setUpdating(false);
        }
    };

    const changeReply = async (remove: boolean) => {
        if (!reply || mutationRef.current) return;
        if (!remove && !replyDraft.trim()) {
            alert('답변 내용을 입력해주세요.');
            return;
        }
        if (remove && !window.confirm('답변을 삭제하시겠습니까? 신고의 현재 처리 상태는 유지됩니다.')) return;
        mutationRef.current = true;
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('num', String(reply.num));
            formData.append('content', replyDraft.trim());
            const response = remove
                ? await axios.delete<number>('http://localhost:80/back/api/report/reportReplyDelete', {
                    headers: getAuthHeaders(), params: { num: reply.num }
                })
                : await axios.put<number>('http://localhost:80/back/api/report/reportReplyUpdate', formData, {
                    headers: getAuthHeaders()
                });
            if (typeof response.data !== 'number' || response.data < 1) throw new Error('답변 처리 실패');
            alert(remove ? '답변이 삭제되었습니다.' : '답변이 수정되었습니다.');
            setRevision(value => value + 1);
        } catch (error) {
            alert(axios.isAxiosError(error) && typeof error.response?.data === 'string'
                ? error.response.data : '답변 처리에 실패했습니다.');
            if (axios.isAxiosError(error) && [404, 409].includes(error.response?.status || 0)) {
                setRevision(value => value + 1);
            }
        } finally {
            mutationRef.current = false;
            setUpdating(false);
        }
    };

    // =========================
    // 상세 조회 중
    // =========================
    if (loading) {
        return (
            <div className={styles.reportDetail}>
                <div className={styles.header}>
                    <h1>신고 내역 상세</h1>
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
            <div className={styles.reportDetail}>
                <div className={styles.header}>
                    <h1>신고 내역 상세</h1>
                </div>
                <div className={styles.notFound} role="alert">{errorMessage || '존재하지 않는 신고 내역입니다.'}</div>
                <button type="button" onClick={() => setRevision(value => value + 1)}>다시 시도</button>
                <div className={styles.actions}>
                    <button className={styles.listButton} onClick={() => navigate('/admin/reportList')}>
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
                    <div className={styles.value}>{REPORT_TYPE_LABELS[report.type]}</div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.label}>신고자</div>
                    <div className={styles.value}>{report.member_num}</div>
                </div>

                {/* 신고 대상 번호 */}
                <div className={styles.detailRow}>
                    <div className={styles.label}>신고 대상 번호</div>
                    <div className={styles.value}>{report.target_num ?? '-'}</div>
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
                            disabled={updating}
                        >
                            <option value="PENDING" disabled={!canApplyStatus(report.status, 'PENDING')}>접수</option>
                            <option value="REVIEWING" disabled={!canApplyStatus(report.status, 'REVIEWING')}>처리중</option>
                            <option value="COMPLETED" disabled={!canApplyStatus(report.status, 'COMPLETED')}>처리완료</option>
                            <option value="REJECTED" disabled={!canApplyStatus(report.status, 'REJECTED')}>반려</option>
                        </select>

                        <button className={styles.applyButton} onClick={handleApply} disabled={updating || status === report.status}>
                            {updating ? '적용 중...' : '적용'}
                        </button>
                    </div>
                </div>

            </div>

            <ReportTargetPreview reportNum={report.num} type={report.type} targetNum={report.target_num} />

            <section className={styles.targetPreview} aria-label="관리자 답변">
                <h2>관리자 답변</h2>
                {reply ? <>
                    <p>작성 관리자 #{reply.admin_num} · {reply.created_date}</p>
                    {editingReply ? <textarea aria-label="관리자 답변 수정" className={styles.replyTextarea}
                        value={replyDraft} onChange={event => setReplyDraft(event.target.value)} disabled={updating} rows={6} />
                        : <div className={styles.contentBox}>{reply.content}</div>}
                    <div className={styles.actions}>
                        {editingReply ? <>
                            <button type="button" className={styles.applyButton} disabled={updating || !replyDraft.trim()}
                                onClick={() => void changeReply(false)}>수정 저장</button>
                            <button type="button" className={styles.listButton} disabled={updating}
                                onClick={() => { setEditingReply(false); setReplyDraft(reply.content); }}>수정 취소</button>
                        </> : <button type="button" className={styles.replyButton} disabled={updating}
                            onClick={() => setEditingReply(true)}>답변 수정</button>}
                        <button type="button" className={styles.deleteReplyButton} disabled={updating}
                            onClick={() => void changeReply(true)}>답변 삭제</button>
                    </div>
                    <p>답변 수정·삭제 시 신고의 처리 상태는 유지됩니다.</p>
                </> : <p>등록된 답변이 없습니다.</p>}
            </section>

            {/* Buttons */}
            <div className={styles.actions}>
                <button className={styles.listButton} disabled={updating} onClick={() => navigate('/admin/reportList')}>
                    목록
                </button>

                {!reply && <button className={styles.replyButton} disabled={updating} onClick={() => navigate(`/admin/reportReply/${report.num}`)}>
                    답변 작성
                </button>}
            </div>

        </div>
    );
};

export default ReportDetail;
