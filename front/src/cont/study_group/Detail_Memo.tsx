import React from 'react';
import styles from './detail.module.css';

export const Detail_Memo: React.FC = () => {
    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>메모</h3>
                <p className={styles.section_desc}>
                    자유롭게 공부를 하다 생긴 질문이나 이해한 점을 작성하는 공간입니다.
                </p>
            </div>
        </div>
    )
}