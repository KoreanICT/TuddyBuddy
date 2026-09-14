import React, { useState } from 'react';
import styles from './videoSummary.module.css';

interface videoUploadProps {
    videoClick: (value: boolean) => void;
    youtubeClick: (value: boolean) => void;
}

export const VideoUpload: React.FC<videoUploadProps> = (props) => {
    const [isopen, setIsopen] = useState(false);

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>동영상 업로드 및 AI 요약</h3>
                <p className={styles.section_desc}>
                    스터디 영상을 업로드하고 AI 요약본을 확인하는 공간입니다.
                </p>
                <div className={styles.upload_placeholder}>
                    <button 
                            type='button'
                            className={styles.upload_btn} 
                            onClick={() => setIsopen(!isopen)}
                    >
                        + 동영상 파일 선택
                    </button>
                    {isopen && (
                        <div className={styles.vuDropdownMenu}>
                            <button
                                type='button'
                                className={styles.vuButton}
                                onClick={() => props.videoClick(true)}>파일 업로드</button>
                            <button
                                type='button'
                                className={styles.vuButton}
                                onClick={() => props.youtubeClick(true)}>YouTube 링크</button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.vlSection}>
                <h3 className={styles.vlTitle}>업로드된 영상</h3>
                <div className={styles.vList}>
                    <button
                        type='button'
                        className={styles.vCard}
                        onClick={() => props.videoClick(true)}>
                        <div className={styles.vThumbanil}>
                            썸네일
                        </div>
                        <p className={styles.vTitle}>
                            프론트엔드 CSS 기초
                        </p>
                        <span className={styles.vDate}>
                            2026-09-14
                        </span>
                    </button>
                    <button
                        type='button'
                        className={styles.vCard}
                        onClick={() => props.videoClick(true)}>
                        <div className={styles.vThumbanil}>
                            썸네일
                        </div>
                        <p className={styles.vTitle}>
                            Python 기초 강의
                        </p>
                        <span className={styles.vDate}>
                            2026-09-10
                        </span>
                    </button>                    
                </div>
            </div>
        </div>
    );
};