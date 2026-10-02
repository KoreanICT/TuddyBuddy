import React, { useRef, useState } from 'react';
import styles from './detail.module.css';
import { useSearchParams } from 'react-router-dom';

interface UploadingFileProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
}

export const Detail_Document_insert: React.FC<UploadingFileProps> = ({
    isOpen,
    onClose,
    onSubmitSuccess
}) => {

    const [title, setTitle] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchParams] = useSearchParams();

    const groupNum = Number(searchParams.get('group_num'));

    if (!isOpen) {
        return null;
    }

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        if (!title.trim()) {
            alert('자료 제목을 입력해주세요.');
            return;
        }

        if (!file) {
            alert('업로드할 파일을 선택해주세요.');
            return;
        }

        if (!groupNum) {
            alert('그룹 정보를 확인할 수 없습니다.');
            return;
        }

        /*
         * 백엔드 연결 전 단계
         *
         * 이후 axios + FormData로 변경
         */

        console.log({
            groupNum,
            title,
            file
        });

        onSubmitSuccess?.();

        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div
            className={styles.document_modal_overlay}
            onClick={handleClose}
        >
            <div
                className={styles.document_modal}
                onClick={(e) => e.stopPropagation()}
            >

                <div className={styles.document_modal_header}>
                    <h2>자료 등록</h2>

                    <button
                        type="button"
                        className={styles.document_modal_close}
                        onClick={handleClose}
                    >
                        ×
                    </button>
                </div>

                <form
                    className={styles.document_upload_form}
                    onSubmit={handleSubmit}
                >

                    <div className={styles.document_form_field}>
                        <label>
                            제목
                        </label>

                        <input
                            type="text"
                            value={title}
                            placeholder="예: 머신러닝 3일차 교재"
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.document_form_field}>
                        <label>
                            파일
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                        />

                        {file && (
                            <div className={styles.selected_file}>
                                <strong>
                                    {file.name}
                                </strong>

                                <span>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.document_modal_actions}>

                        <button
                            type="button"
                            className={styles.document_cancel_btn}
                            onClick={handleClose}
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className={styles.document_submit_btn}
                        >
                            업로드
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
};