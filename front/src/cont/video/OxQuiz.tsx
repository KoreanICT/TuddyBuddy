import React from 'react'
import style from './videoSummary.module.css'


const OxQuiz: React.FC = () => {
    return (
        <section className={style.oxQuiz}>
            <div className={style.oxHeader}>
                <span className={style.oxLabel}>
                    QUIZ
                </span>
                <h2 className={style.oxTitle}>
                    O/X 퀴즈
                </h2>
                <p className={style.oxDescription}>
                    영상 내용을 얼마나 이해했는지 확인해보세요.
                </p>
            </div>
            <div className={style.oxProgress}>
                <span>문제 1</span>
                <span>1 / 5</span>
            </div>
            <p className={style.oxQuestion}>
                문제 1. 내용
            </p>
            <div className={style.oxButtons}>
                <button type='button' className={style.oxButton}>O</button>
                <button type='button' className={style.oxButton}>X</button>
            </div>
        </section>
    )
}

export default OxQuiz