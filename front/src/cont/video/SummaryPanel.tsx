import React from 'react'
import styles from './videoSummary.module.css'

const SummaryPanel: React.FC = () => {
    return (
        <section className={styles.sPanel}>
            <div className={styles.spHeader}>
                <span className={styles.spLabel}>
                    AI SUMMARY
                </span>

                <h2 className={styles.spTitle}>
                    영상 요약
                </h2>
            </div>

            <div className={styles.spContent}>
                <section className={styles.sSection}>
                    <h3 className={styles.ssTitle}>
                        핵심 내용
                    </h3>
                    <p className={styles.ssText}>
                        업로드된 영상의 핵심내용
                    </p>
                </section>

                <section className={styles.sSection}>
                    <h3 className={styles.ssTitle}>
                        주요 키워드
                    </h3>
                    <div className={styles.skList}>
                        <span className={styles.sKeyword}>내용1</span>
                        <span className={styles.sKeyword}>내용2</span>
                        <span className={styles.sKeyword}>내용3</span>
                        <span className={styles.sKeyword}>내용4</span>
                    </div>
                </section>

                <section className={styles.sSection}>
                    <h3 className={styles.ssTitle}>
                        주요 내용
                    </h3>
                    <ul className={styles.sList}>
                        <li className={styles.slItem}>
                            <span className={styles.slTime}>
                                00:00
                            </span>
                            <p>1. 첫번째</p>
                        </li>
                        <li className={styles.slItem}>
                            <span className={styles.slTime}>
                                00:00
                            </span>
                            <p>2. 두번째</p>
                        </li>
                        <li className={styles.slItem}>
                            <span className={styles.slTime}>
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