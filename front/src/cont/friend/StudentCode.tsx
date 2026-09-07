import React, { useState } from 'react';
import styles from './studentCode.module.css';
import Modal from '../modal/Modal';

const StudentCode: React.FC = () => {

    const [isOpen, setIsOpen] = useState(false);

    // TODO: 추후 로그인한 회원의 실제 Student Code를 가져오기
    const studentCode = '8f3a2b7c-91d4-4e6a-b528-73c9d1f04a82';

    return (
        <div className={styles.studentCode}>

            {/* Header */}
            <div className={styles.header}>
                <h1>내 스터던트 코드</h1>

                <p>
                    친구가 나를 추가할 때 사용하는 코드입니다.
                </p>
            </div>


            {/* Student Code */}
            <div className={styles.card}>

                <div className={styles.icon}>
                    👤
                </div>

                <div className={styles.info}>
                    <h2>스터던트 코드</h2>

                    <p>
                        친구 추가에 사용할 수 있는 나만의 코드입니다.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.viewButton}
                    onClick={() => setIsOpen(true)}
                >
                    코드 확인
                </button>

            </div>


            {/* Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="내 스터던트 코드"
            >
                <div className={styles.modalContent}>

                    <p className={styles.modalDescription}>
                        친구가 나를 추가할 때 아래 코드를 입력하면 됩니다.
                    </p>

                    <div className={styles.codeBox}>
                        {studentCode}
                    </div>

                    <button
                        type="button"
                        className={styles.confirmButton}
                        onClick={() => setIsOpen(false)}
                    >
                        확인
                    </button>

                </div>
            </Modal>

        </div>
    );
};

export default StudentCode;