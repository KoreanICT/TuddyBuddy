import React, { useState } from 'react';
import Modal from '../modal/Modal';
import styles from './studentCodeModal.module.css';

interface StudentCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentCode: string;
}

const StudentCodeModal: React.FC<StudentCodeModalProps> = ({
    isOpen,
    onClose,
    studentCode
}) => {

    const [copied, setCopied] = useState(false);


    // 스터던트 코드 복사
    const handleCopy = async () => {

        try {

            await navigator.clipboard.writeText(studentCode);

            setCopied(true);

            // 2초 후 다시 "코드 복사"로 변경
            setTimeout(() => {
                setCopied(false);
            }, 2000);

        } catch (error) {

            console.error('스터던트 코드 복사 실패:', error);
            alert('코드 복사에 실패했습니다.');

        }
    };


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="내 스터던트 코드"
        >
            <div className={styles.modalContent}>

                <p className={styles.modalDescription}>
                    친구가 나를 추가할 때 아래 코드를 입력하면 됩니다.
                </p>


                {/* Student Code */}
                <div className={styles.codeBox}>
                    {studentCode}
                </div>


                {/* Buttons */}
                <div className={styles.buttonGroup}>

                    <button
                        type="button"
                        className={styles.copyButton}
                        onClick={handleCopy}
                    >
                        {copied ? '복사 완료!' : '코드 복사'}
                    </button>

                    <button
                        type="button"
                        className={styles.confirmButton}
                        onClick={onClose}
                    >
                        확인
                    </button>

                </div>

            </div>
        </Modal>
    );
};

export default StudentCodeModal;