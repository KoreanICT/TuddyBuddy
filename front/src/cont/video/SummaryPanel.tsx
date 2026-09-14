import React from 'react'
import style from './videoSummary.module.css'

const SummaryPanel: React.FC = () => {
    return (
        <section className={style.sPanel}>
            <div className={style.spHeader}>
                <span className={style.spLabel}>
                    AI SUMMARY
                </span>

                <h2 className={style.spTitle}>
                    영상 요약
                </h2>
            </div>

            <div className={style.spContent}>
                <section className={style.sSection}>
                    <h3 className={style.ssTitle}>
                        핵심 내용
                    </h3>
                    <p className={style.ssText}>
                        업로드된 영상의 핵심내용
                    </p>
                </section>

                <section className={style.sSection}>
                    <h3 className={style.ssTitle}>
                        주요 키워드
                    </h3>
                    <div className={style.skList}>
                        <span className={style.sKeyword}>내용1</span>
                        <span className={style.sKeyword}>내용2</span>
                        <span className={style.sKeyword}>내용3</span>
                        <span className={style.sKeyword}>내용4</span>
                    </div>
                </section>

                <section className={style.sSection}>
                    <h3 className={style.ssTitle}>
                        주요 내용
                    </h3>
                    <ul className={style.sList}>
                        <li className={style.slItem}>
                            <span className={style.slTime}>
                                00:00
                            </span>
                            <p>1. 첫번째</p>
                        </li>
                        <li className={style.slItem}>
                            <span className={style.slTime}>
                                00:00
                            </span>
                            <p>2. 두번째</p>
                        </li>
                        <li className={style.slItem}>
                            <span className={style.slTime}>
                                00:00
                            </span>
                            <p>3. 세번째</p>
                        </li>
                    </ul>
                </section>
            </div>
        </section>
    )
}

export default SummaryPanel