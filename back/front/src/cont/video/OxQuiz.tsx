import React from 'react'
import styles from './videoSummary.module.css'


const OxQuiz: React.FC = () => {
    return (
        <section className={styles.oxQuiz}>
            <div className={styles.oxHeader}>
                <span className={styles.oxLabel}>
                    QUIZ
                </span>
                <h2 className={styles.oxTitle}>
                    O/X 퀴즈
                </h2>
                <p className={styles.oxDescription}>
                    영상 내용을 얼마나 이해했는지 확인해보세요.
                </p>
            </div>
            <div className={styles.oxProgress}>
                <span>문제 1</span>
                <span>1 / 5</span>
            </div>
            <p className={styles.oxQuestion}>
                문제 1. 내용
            </p>
            <div className={styles.oxButtons}>
                <button type='button' className={styles.oxButton}>O</button>
                <button type='button' className={styles.oxButton}>X</button>
            </div>

            {/* 정답 및 해설 */}
            <div className={styles.oxAnswer}>
                <p className={styles.oxAnswerTitle}>
                    정답 : O
                </p>
                <p className={styles.oxExplanation}>
                    정답에 대한 해설이 표시되는 영역입니다.
                </p>
            </div>

        </section>
    )
}

export default OxQuiz