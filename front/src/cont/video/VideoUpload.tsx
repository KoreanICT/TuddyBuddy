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
        </div>
    );
};