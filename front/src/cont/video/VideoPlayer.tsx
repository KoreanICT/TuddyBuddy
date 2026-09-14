import React from 'react'
import style from './videoSummary.module.css'

const VideoPlayer: React.FC = () => {
    return (
        <section className={style.vPlayer}>
            <div className={style.vpHeader}>
                <h2 className={style.vpTitle}>업로드된 영상</h2>
            </div>

            <div className={style.vpContent}>
                <div className={style.vpPlaceholder}>
                    <span className={style.vpIcon}>▶</span>
                </div>
                <p className={style.vpText}>영상이 표시되는 영역입니다.</p>
            </div>
        </section>
    )
}

export default VideoPlayer