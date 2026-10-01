import React from 'react';
import styles from './detail.module.css';

export const Detail_Image: React.FC = () => {
    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>이미지 업로드 및 문제 풀이</h3>
                <p className={styles.section_desc}>
                    공부할 이미지를 업로드하고 문제를 생성 및 풀이하는 공간입니다.
                </p>
                <div className={styles.upload_placeholder}>
                    <button className={styles.upload_btn}>+ 이미지 파일 선택</button>
                </div>
            </div>
        </div>
    )
}