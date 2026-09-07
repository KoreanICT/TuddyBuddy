import React from 'react'

const OxQuiz: React.FC = () => {
    return (
        <section className='oxQuiz'>
            <div className='oxHeader'>
                <span className='oxLabel'>
                    QUIZ
                </span>
                <h2 className='oxTitle'>
                    O/X 퀴즈
                </h2>
                <p className='oxDescription'>
                    영상 내용을 얼마나 이해했는지 확인해보세요.
                </p>
            </div>
            <div className='oxProgress'>
                <span>문제 1</span>
                <span>1 / 5</span>
            </div>
            <p className='oxQuestion'>
                문제 1. 내용
            </p>
            <div className='oxButtons'>
                <button type='button' className='button'>O</button>
                <button type='button' className='button'>X</button>
            </div>
        </section>
    )
}

export default OxQuiz