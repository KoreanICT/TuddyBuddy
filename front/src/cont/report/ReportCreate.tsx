import { BACKEND_URL } from '../../login/authHttp';
// 주용현

import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './report.module.css';
import { useAuth } from '../../login/hooks/useAuth';

import { readReportTarget, REPORT_TYPE_LABELS } from './reportTarget';

interface ReportForm {
    reason: string;
    content: string;
}

const REPORT_REASON_MAX_BYTES = 50;

const ReportCreate: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const previousPath = (location.state as { reportReturnTo?: unknown } | null)?.reportReturnTo;
    const returnTo = typeof previousPath === 'string' && previousPath.startsWith('/')
        && !previousPath.startsWith('//') && !previousPath.includes('\\') ? previousPath : '/';
    const [searchParams] = useSearchParams();
    const target = readReportTarget(searchParams);
    const { memberNum, token } = useAuth();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);


    const [form, setForm] = useState<ReportForm>({
        reason: '',
        content: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const reasonBytes = new TextEncoder().encode(form.reason.trim()).length;

    // 입력값 변경
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // 신고 등록
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (submitting) return;

        if (!token || memberNum == null) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!target) {
            alert('신고 대상 정보가 올바르지 않습니다. 원래 화면에서 다시 신고해주세요.');
            return;
        }

        if (!form.reason.trim() || reasonBytes > REPORT_REASON_MAX_BYTES) {
            alert('신고 사유를 50바이트 이내로 입력해주세요. 한글은 보통 한 글자당 3바이트입니다.');
            return;
        }

        if (!form.content.trim()) {
            alert('신고 내용을 입력해주세요.');
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();

            formData.append('type', target.type);
            formData.append('target_num', String(target.targetNum));
            formData.append('category', form.reason.trim());
            formData.append('content', form.content.trim());

            const response = await axios.post(
                `${BACKEND_URL}/api/report/reportAdd`,
                formData,
                { headers: getAuthHeaders() }
            );

            console.log('신고 등록 결과:', response.data);
            alert('신고가 정상적으로 접수되었습니다.');
            navigate(returnTo, { replace: true });

        } catch (error) {
            console.error('신고 등록 실패:', error);

            if (axios.isAxiosError(error) && !error.response) {
                alert('서버에 연결할 수 없습니다. 백엔드 실행 상태를 확인해주세요.');
            } else {
                alert('신고 접수 중 오류가 발생했습니다.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // 취소
    // =========================
    const handleCancel = () => {
        if (form.reason || form.content) {
            const confirmCancel = window.confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?');
            if (!confirmCancel) return;
        }

        navigate(returnTo, { replace: true });
    };

    return (
        <div className={styles.reportCreate}>
            <div className={styles.header}>
                <h1>신고 작성</h1>
                <p>신고 사유와 상세 내용을 작성해주세요.</p>
            </div>

            <form className={styles.reportForm} onSubmit={handleSubmit}>

                {/* 버튼에서 전달받은 대상은 작성 화면에서 변경하지 않습니다. */}
                {!target && (
                    <div className={styles.notice} role="alert">
                        신고 대상 정보가 올바르지 않습니다. 원래 화면에서 다시 신고해주세요.
                    </div>
                )}
                <div className={styles.formRow}>
                    <span className={styles.label}>신고 대상</span>
                    <div className={styles.formContent}>
                        {target ? (
                            target.type === 'report'
                                ? REPORT_TYPE_LABELS[target.type]
                                : `${REPORT_TYPE_LABELS[target.type]} #${target.targetNum}`
                        ) : '대상 정보 오류'}
                    </div>
                </div>

                {/* 신고 사유 */}
                <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="reason">신고 사유</label>
                    <div className={styles.formContent}>
                        <input
                            id="reason" name="reason" type="text" value={form.reason} maxLength={REPORT_REASON_MAX_BYTES}
                            aria-describedby="report-reason-help" aria-invalid={reasonBytes > REPORT_REASON_MAX_BYTES}
                            onChange={handleChange} className={styles.input}
                            placeholder="신고 사유를 입력해주세요."
                        />
                        <div id="report-reason-help" className={styles.textCount}>
                            {reasonBytes} / {REPORT_REASON_MAX_BYTES}바이트 · 한글은 보통 한 글자당 3바이트
                        </div>
                    </div>
                </div>

                {/* 신고 내용 */}
                <div className={styles.formRow}>
                    <label className={styles.label} htmlFor="content">상세 내용</label>
                    <div className={styles.formContent}>
                        <textarea
                            id="content" name="content" value={form.content}
                            onChange={handleChange} className={styles.textarea}
                            placeholder="신고 내용을 자세히 작성해주세요." rows={10}
                        />
                        <div className={styles.textCount}>{form.content.length}자</div>
                    </div>
                </div>

                {/* 안내 */}
                <div className={styles.notice}>
                    <strong>신고 전 확인해주세요.</strong>
                    <p>허위 신고 또는 반복적인 악의성 신고는 서비스 이용에 제한이 발생할 수 있습니다.</p>
                </div>

                {/* 버튼 */}
                <div className={styles.actions}>
                    <button type="button" className={styles.cancelButton} onClick={handleCancel} disabled={submitting}>
                        이전 화면으로 돌아가기
                    </button>
                    <button type="submit" className={styles.submitButton} disabled={submitting || !target}>
                        {submitting ? '접수 중...' : '신고 접수'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ReportCreate;
