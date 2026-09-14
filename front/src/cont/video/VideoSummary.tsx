import React, { useState } from 'react'
import VideoPlayer from './VideoPlayer'
import SummaryPanel from './SummaryPanel'
import OxQuiz from './OxQuiz'
import MindMap from './MindMap'

import style from './videoSummary.module.css';
import { VideoUpload } from './VideoUpload'


const VideoSummary: React.FC = () => {

    const [videoFile, setVideoFile] = useState(false);
    const [youtubeLink, setYoutubeLink] = useState(false);
    const [videoTab, setVideoTab] = useState<'SummaryPanel' | 'OxQuiz' | 'MindMap'>("SummaryPanel")
    const hasVideo = videoFile || youtubeLink;

    return (
        <main className={style.vSummary}>
            <div className='vsContainer'>
                {!hasVideo ? (
                    <VideoUpload
                        videoClick={setVideoFile}
                        youtubeClick={setYoutubeLink} />
                ) : (
                    <div className={style.vsContent}>
                        <VideoPlayer />
                        <div className={style.vsTabWrap}>
                            <div className={style.vsTab}>
                                <button
                                    type="button"
                                    className={`${style.vsTabButton} ${videoTab === "SummaryPanel" ? style.vsTab_isactive : ""}`}
                                    onClick={() => setVideoTab("SummaryPanel")}>AI 영상 요약</button>
                                <button
                                    type="button"
                                    className={`${style.vsTabButton} ${videoTab === "OxQuiz" ? style.vsTab_isactive : ""}`}
                                    onClick={() => setVideoTab("OxQuiz")}>O/X 문제</button>
                                <button
                                    type='button'
                                    className={`${style.vsTabButton} ${videoTab === "MindMap" ? style.vsTab_isactive : ""}`}
                                    onClick={() => setVideoTab("MindMap")}>마인드맵</button>
                            </div>
                            < div className={style.vsTabContent}>
                                {videoTab === 'SummaryPanel' && <SummaryPanel />}
                                {videoTab === 'OxQuiz' && <OxQuiz />}
                                {videoTab === 'MindMap' && <MindMap />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main >
    )
}

export default VideoSummary