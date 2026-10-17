// 주용현

import axios from 'axios';
import { useAuth } from '../../../login/hooks/useAuth';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './report.module.css';

import { ReportType, REPORT_TYPE_LABELS } from '../../report/reportTarget';

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
                    { headers: getAuthHeaders(), params: { num: id } }
                );

                if (!active) return;

                setReport(response.data);
                setStatus(response.data.status);

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
    }, [id, getAuthHeaders]);

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
        if (!report || updating) return;

        if (!canApplyStatus(report.status, status)) {
            alert('현재 신고 상태에서 선택한 상태로 변경할 수 없습니다.');
            return;
        }

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
        } finally {
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

                        <button className={styles.applyButton} onClick={handleApply} disabled={updating}>
                            {updating ? '적용 중...' : '적용'}
                        </button>
                    </div>
                </div>

            </div>

            {/* Buttons */}
            <div className={styles.actions}>
                <button className={styles.listButton} onClick={() => navigate('/admin/reportList')}>
                    목록
                </button>

                <button className={styles.replyButton} onClick={() => navigate(`/admin/reportReply/${report.num}`)}>
                    답변 작성
                </button>
            </div>

        </div>
    );
};

export default ReportDetail;
