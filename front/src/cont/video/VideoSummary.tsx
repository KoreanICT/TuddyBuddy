import React from 'react'
import VideoUpload from './VideoUpload'
import VideoPlayer from './VideoPlayer'
import SummaryPanel from './SummaryPanel'
import OxQuiz from './OxQuiz'
import MindMap from './MindMap'

import "./videoSummary.css"


const VideoSummary: React.FC = () => {
    return (
        <main className='vSummary'>
            <div className='vsContainer'>
                <VideoUpload />
                <div className='vsContent'>
                    <VideoPlayer />
                    <SummaryPanel />
                    <OxQuiz />
                    <MindMap />
                </div>
            </div>
        </main>
    )
}

export default VideoSummary