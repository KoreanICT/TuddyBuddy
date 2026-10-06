import React from 'react'
import styles from './videoSummary.module.css'

const VideoPlayer: React.FC = () => {
    return (
        <section className={styles.vPlayer}>
            <div className={styles.vpHeader}>
                <h2 className={styles.vpTitle}>업로드된 영상</h2>
            </div>

            <div className={styles.vpContent}>
                <div className={styles.vpPlaceholder}>
                    <span className={styles.vpIcon}>▶</span>
                </div>
                <p className={styles.vpText}>영상이 표시되는 영역입니다.</p>
            </div>
        </section>
    )
}

export default VideoPlayer