import React from 'react';
import styles from './detail.module.css';

export const Detail_Video: React.FC = () => {
    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>동영상 업로드 및 AI 요약</h3>
                <p className={styles.section_desc}>
                    스터디 영상을 업로드하고 AI 요약본을 확인하는 공간입니다.
                </p>
                <div className={styles.upload_placeholder}>
                    <button className={styles.upload_btn}>+ 동영상 파일 선택</button>
                </div>
            </div>
        </div>
    );
};