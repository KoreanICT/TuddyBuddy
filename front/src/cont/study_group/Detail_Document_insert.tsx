//작성자 : 오진석
import React, { useRef, useState } from 'react';
import styles from './detail.module.css';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface UploadingFileProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
    groupNum: number;
}

interface DocumentData {
    

}
export const Detail_Document_insert: React.FC<UploadingFileProps> = ({isOpen,onClose,onSubmitSuccess,groupNum}) => {

    const [title, setTitle] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    if (!isOpen) {
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        const MAX_SIZE = 200 * 1024 * 1024;
        if (selectedFile.size > MAX_SIZE) {
            alert('해당 파일의 용량이 최대 용량을 초과했습니다.');
            e.target.value = '';
            return;
        }

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'docx', 'xlsx', 'pdf', 'py', 'java']
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

        if(!fileExtension || !allowedExtensions.includes(fileExtension)) {
            alert('업로드를 지원하지 않는 확장자 파일입니다.');
            e.target.value = '';
            return;
        }
        setFile(selectedFile);
    };
    

    const handleSubmit = (
        e: React.SubmitEvent<HTMLFormElement>
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
        const formData = new FormData();

        formData.append('title', title.trim());
        formData.append('file', file);
        try {
            setIsSaving(true);

            const response = axios.post(
                `http://localhost/back/api/detail/document/addDocument/${groupNum}`,
                formData
            )

            alert('참고 자료가 등록되었습니다.');
            onSubmitSuccess?.();
            resetForm();
        } catch (error) {
            console.error('문서 저장 실패 : ',error);
            alert ('문서 저장 중 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
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