import React from 'react';
import styles from './detail.module.css';

export const Detail_Overview: React.FC = () => {
    return (
        <div className={styles.detail_content_wrapper}>
            {/* 공부 현황 요약 영역 */}
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>공부 현황</h3>
                <div className={styles.empty_state}>
                    <span className={styles.clock_icon}>⏰</span>
                    <p>오늘은 공부 기록이 없네요..</p>
                    <p className={styles.sub_text}>오늘도 열공! 아자아자!</p>
                </div>
            </div>

            {/* 최근 공지 영역 */}
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>최근 공지</h3>
                <p className={styles.empty_notice}>공지사항이 없습니다.</p>
            </div>
        </div>
    );
};