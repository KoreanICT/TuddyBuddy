import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './report.module.css';

type ReportType =
    | 'POST'
    | 'COMMENT'
    | 'USER'
    | 'STUDY';

interface ReportForm {
    type: ReportType;
    target: string;
    reason: string;
    content: string;
}

const ReportCreate: React.FC = () => {

    const navigate = useNavigate();

    // TODO:
    // 로그인 기능 연결 후
    // reporter는 로그인 사용자 정보에서 가져오기

    const [form, setForm] = useState<ReportForm>({
        type: 'POST',
        target: '',
        reason: '',
        content: '',
    });

    // =========================
    // 입력값 변경
    // =========================

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >
    ) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // =========================
    // 신고 등록
    // =========================

    const handleSubmit = (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!form.target.trim()) {
            alert('신고 대상을 입력해주세요.');
            return;
        }

        if (!form.reason.trim()) {
            alert('신고 사유를 입력해주세요.');
            return;
        }

        if (!form.content.trim()) {
            alert('신고 내용을 입력해주세요.');
            return;
        }

        const reportData = {

            // TODO:
            // 로그인 연결 후 실제 회원 정보 사용
            reporter: 'loginUser',

            type: form.type,
            target: form.target,
            reason: form.reason,
            content: form.content,

            // 신고 등록 시 최초 상태
            status: 'PENDING',

            createdAt:
                new Date().toISOString(),
        };

        // TODO: 백엔드 API 연결
        console.log(
            '신고 등록:',
            reportData
        );

        alert(
            '신고가 정상적으로 접수되었습니다.'
        );

        // 임시로 홈 이동
        navigate('/');
    };

    // =========================
    // 취소
    // =========================

    const handleCancel = () => {

        if (
            form.target ||
            form.reason ||
            form.content
        ) {

            const confirmCancel =
                window.confirm(
                    '작성 중인 내용이 있습니다. 취소하시겠습니까?'
                );

            if (!confirmCancel) {
                return;
            }
        }

        navigate(-1);
    };

    return (
        <div className={styles.reportCreate}>

            {/* Header */}
            <div className={styles.header}>

                <h1>
                    신고 작성
                </h1>

                <p>
                    서비스 이용 중 발견한 부적절한
                    게시글, 댓글, 회원 또는 스터디를 신고할 수 있습니다.
                </p>

            </div>


            {/* Form */}
            <form
                className={styles.reportForm}
                onSubmit={handleSubmit}
            >

                {/* 신고 유형 */}
                <div className={styles.formRow}>

                    <label
                        className={styles.label}
                        htmlFor="type"
                    >
                        신고 유형
                    </label>

                    <div className={styles.formContent}>

                        <select
                            id="type"
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className={styles.select}
                        >

                            <option value="POST">
                                게시글
                            </option>

                            <option value="COMMENT">
                                댓글
                            </option>

                            <option value="USER">
                                회원
                            </option>

                            <option value="STUDY">
                                스터디
                            </option>

                        </select>

                    </div>

                </div>


                {/* 신고 대상 */}
                <div className={styles.formRow}>

                    <label
                        className={styles.label}
                        htmlFor="target"
                    >
                        신고 대상
                    </label>

                    <div className={styles.formContent}>

                        <input
                            id="target"
                            name="target"
                            type="text"
                            value={form.target}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="신고할 게시글, 댓글, 회원 또는 스터디를 입력해주세요."
                        />

                    </div>

                </div>


                {/* 신고 사유 */}
                <div className={styles.formRow}>

                    <label
                        className={styles.label}
                        htmlFor="reason"
                    >
                        신고 사유
                    </label>

                    <div className={styles.formContent}>

                        <input
                            id="reason"
                            name="reason"
                            type="text"
                            value={form.reason}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="신고 사유를 입력해주세요."
                        />

                    </div>

                </div>


                {/* 신고 내용 */}
                <div className={styles.formRow}>

                    <label
                        className={styles.label}
                        htmlFor="content"
                    >
                        상세 내용
                    </label>

                    <div className={styles.formContent}>

                        <textarea
                            id="content"
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="신고 내용을 자세히 작성해주세요."
                            rows={10}
                        />

                        <div className={styles.textCount}>
                            {form.content.length}자
                        </div>

                    </div>

                </div>


                {/* 안내 */}
                <div className={styles.notice}>

                    <strong>
                        신고 전 확인해주세요.
                    </strong>

                    <p>
                        허위 신고 또는 반복적인 악의성 신고는
                        서비스 이용에 제한이 발생할 수 있습니다.
                    </p>

                </div>


                {/* Buttons */}
                <div className={styles.actions}>

                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={handleCancel}
                    >
                        취소
                    </button>

                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        신고 접수
                    </button>

                </div>

            </form>

        </div>
    );
};

export default ReportCreate;