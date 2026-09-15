import React from 'react'
import style from './videoSummary.module.css'

const MindMap: React.FC = () => {
    return (
        <section className={style.mindMap}>
            <div className={style.mmHeader}>
                <span className={style.mmLabel}>
                    MIND MAP
                </span>
                <h2 className={style.mmTitle}>
                    마인드맵
                </h2>
            </div>
            <div className={style.mmContent}>
                <div className={style.mmCenter}>
                    Python
                </div>
                <div className={`${style.mmNode} ${style.mmTop}`}>
                    내용 1
                </div>
                <div className={`${style.mmNode} ${style.mmLeft}`}>
                    내용 2
                </div>
                <div className={`${style.mmNode} ${style.mmRight}`}>
                    내용 3
                </div>
                <div className={`${style.mmNode} ${style.mmBottom}`}>
                    내용 4
                </div>
            </div>
        </section>
    )
}

export default MindMap