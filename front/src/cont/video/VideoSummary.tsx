import React, { useState } from 'react'
import VideoPlayer from './VideoPlayer'
import SummaryPanel from './SummaryPanel'
import OxQuiz from './OxQuiz'
import MultipleChoice from './MultipleChoice'

import styles from './videoSummary.module.css';
import { VideoUpload } from './VideoUpload'


const VideoSummary: React.FC = () => {

    const [videoFile, setVideoFile] = useState(false);
    const [youtubeLink, setYoutubeLink] = useState(false);
    const [videoTab, setVideoTab] = useState<'SummaryPanel' | 'OxQuiz' | 'MultipleChoice'>("SummaryPanel")
    const hasVideo = videoFile || youtubeLink;

    const backClict = () => {
        setVideoFile(false);
        setYoutubeLink(false);
    }
    return (
        <main className={styles.vSummary}>
            <div className='vsContainer'>
                {!hasVideo ? (
                    <VideoUpload
                        videoClick={setVideoFile}
                        youtubeClick={setYoutubeLink} />
                ) : (
                    <div className={styles.vsBackDetail}>
                        <button
                            type="button"
                            className={styles.vsBackButton}
                            onClick={() => backClict()}
                        >
                            ← 뒤로가기
                        </button>
                        <div className={styles.vsContent}>
                            <VideoPlayer />
                            <div className={styles.vsTabWrap}>
                                <div className={styles.vsTab}>
                                    <button
                                        type="button"
                                        className={`${styles.vsTabButton} ${videoTab === "SummaryPanel" ? styles.vsTab_isactive : ""}`}
                                        onClick={() => setVideoTab("SummaryPanel")}>AI 영상 요약</button>
                                    <button
                                        type='button'
                                        className={`${styles.vsTabButton} ${videoTab === "MultipleChoice" ? styles.vsTab_isactive : ""}`}
                                        onClick={() => setVideoTab("MultipleChoice")}>연습 문제</button>
                                    <button
                                        type="button"
                                        className={`${styles.vsTabButton} ${videoTab === "OxQuiz" ? styles.vsTab_isactive : ""}`}
                                        onClick={() => setVideoTab("OxQuiz")}>O/X 문제</button>
                                </div>
                                < div className={styles.vsTabContent}>
                                    {videoTab === 'SummaryPanel' && <SummaryPanel />}
                                    {videoTab === 'MultipleChoice' && <MultipleChoice />}
                                    {videoTab === 'OxQuiz' && <OxQuiz />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main >
    )
}

export default VideoSummary