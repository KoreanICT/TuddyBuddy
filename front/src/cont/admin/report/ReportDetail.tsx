import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './report.module.css'

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

interface Report {
    id: number;
    type: ReportType;
    reporter: string;
    target: string;
    reason: string;
    content: string;
    status: ReportStatus;
    createdAt: string;
}

const ReportDetail: React.FC = () => {

    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    // TODO: 백엔드 연결 후 상세 조회 API로 교체
    const reports: Report[] = [
        {
            id: 1,
            type: 'POST',
            reporter: 'user01',
            target: '게시글 #15',
            reason: '욕설 및 비방',
            content:
                '해당 게시글에서 다른 회원을 대상으로 지속적인 욕설 및 비방 표현이 사용되었습니다.',
            status: 'PENDING',
            createdAt: '2026-09-07',
        },
        {
            id: 2,
            type: 'COMMENT',
            reporter: 'user02',
            target: '댓글 #32',
            reason: '도배성 댓글',
            content:
                '동일하거나 유사한 내용의 댓글이 반복적으로 작성되었습니다.',
            status: 'REVIEWING',
            createdAt: '2026-09-06',
        },
        {
            id: 3,
            type: 'USER',
            reporter: 'user03',
            target: 'user09',
            reason: '부적절한 행동',
            content:
                '스터디 그룹 내에서 반복적으로 다른 회원에게 불쾌감을 주는 행동을 했습니다.',
            status: 'COMPLETED',
            createdAt: '2026-09-05',
        },
        {
            id: 4,
            type: 'STUDY',
            reporter: 'user04',
            target: 'React 스터디',
            reason: '광고성 스터디',
            content:
                '스터디 목적과 관계없는 상업성 광고 내용이 지속적으로 게시되고 있습니다.',
            status: 'REJECTED',
            createdAt: '2026-09-04',
        },
    ];

    const selectedReport = reports.find(
        report => report.id === Number(id)
    );

    const [status, setStatus] =
        useState<ReportStatus>(
            selectedReport?.status ?? 'PENDING'
        );

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

    // =========================
    // 상태 적용
    // =========================

    const handleApply = () => {

        if (!selectedReport) {
            return;
        }

        const updateData = {
            ...selectedReport,
            status,
        };

        // TODO: 백엔드 API 연결
        console.log(
            '신고 상태 수정:',
            updateData
        );

        alert(
            `신고 상태가 "${getStatusText(status)}" 상태로 변경되었습니다.`
        );
    };

    // =========================
    // 신고 데이터 없는 경우
    // =========================

    if (!selectedReport) {

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
                        onClick={() =>
                            navigate('/admin/reportList')
                        }
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

                <h1>
                    신고 내역 상세
                </h1>

                <p>
                    신고 정보를 확인하고 처리 상태를 관리합니다.
                </p>

            </div>

            {/* Detail Card */}
            <div className={styles.detailCard}>

                <div className={styles.detailRow}>

                    <div className={styles.label}>
                        신고 번호
                    </div>

                    <div className={styles.value}>
                        {selectedReport.id}
                    </div>

                </div>

                <div className={styles.detailRow}>

                    <div className={styles.label}>
                        신고 유형
                    </div>

                    <div className={styles.value}>
                        {getTypeText(selectedReport.type)}
                    </div>

                </div>

                <div className={styles.detailRow}>

                    <div className={styles.label}>
                        신고자
                    </div>

                    <div className={styles.value}>
                        {selectedReport.reporter}
                    </div>

                </div>

                <div className={styles.detailRow}>

                    <div className={styles.label}>
                        신고 대상
                    </div>

                    <div className={styles.value}>
                        {selectedReport.target}
                    </div>

                </div>

                <div className={styles.detailRow}>

                    <div className={styles.label}>
                        신고 사유
                    </div>

                    <div className={styles.value}>
                        {selectedReport.reason}
                    </div>

                </div>

                <div className={styles.detailContent}>

                    <div className={styles.label}>
                        신고 내용
                    </div>

                    <div className={styles.contentBox}>
                        {selectedReport.content}
                    </div>

                </div>

                <div className={styles.detailRow}>

                    <div className={styles.label}>
                        신고일
                    </div>

                    <div className={styles.value}>
                        {selectedReport.createdAt}
                    </div>

                </div>

                <div className={styles.detailRow}>

                    <div className={styles.label}>
                        처리 상태
                    </div>

                    <div className={styles.statusArea}>

                        <select
                            className={styles.select}
                            value={status}
                            onChange={e =>
                                setStatus(
                                    e.target.value as ReportStatus
                                )
                            }
                        >
                            <option value="PENDING">
                                접수
                            </option>

                            <option value="REVIEWING">
                                처리중
                            </option>

                            <option value="COMPLETED">
                                처리완료
                            </option>

                            <option value="REJECTED">
                                반려
                            </option>
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
                    onClick={() =>
                        navigate('/admin/reportList')
                    }
                >
                    목록
                </button>

                <button
                    className={styles.replyButton}
                    onClick={() =>
                        navigate(
                            `/admin/reportReply/${selectedReport.id}`
                        )
                    }
                >
                    답변 작성
                </button>

            </div>

        </div>
    );
};

export default ReportDetail;