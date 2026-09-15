import React from 'react'
import styles from './videoSummary.module.css'

const MultipleChoice: React.FC = () => {
    return (
        <section className={styles.multipleChoice}>
            <div className={styles.mcHeader}>
                <span className={styles.mcLabel}>
                    MULTIPLE CHOICE
                </span>
                <h2 className={styles.mcTitle}>
                    5지선다 문제
                </h2>
                <p className={styles.mcDescription}>
                    영상을 바탕으로 정답을 선택해주세요.
                </p>
            </div>
            <div className={styles.mcProgress}>
                <span>문제 1</span>
                <span>1 / 5</span>
            </div>
            <div className={styles.mcQuestion}>
                영상의 핵심 내용으로 알맞은 것은 무엇인가요?
            </div>
            <div className={styles.mcOptions}>
                <button className={styles.mcOption}>
                    <span className={styles.mcNumber}>1</span>
                    첫번째 보기
                </button>
                <button className={styles.mcOption}>
                    <span className={styles.mcNumber}>2</span>
                    두번째 보기
                </button>
                <button className={styles.mcOption}>
                    <span className={styles.mcNumber}>3</span>
                    세번째 보기
                </button>
                <button className={styles.mcOption}>
                    <span className={styles.mcNumber}>4</span>
                    네번째 보기
                </button>
                <button className={styles.mcOption}>
                    <span className={styles.mcNumber}>5</span>
                    다섯번째 보기
                </button>
            </div>
        </section>
    )
}

export default MultipleChoice