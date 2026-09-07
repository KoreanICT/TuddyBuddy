import React from 'react'


const VideoPlayer: React.FC = () => {
    return (
        <section className='vPlayer'>
            <div className='vpHeader'>
                <h2 className='vpTitle'>업로드된 영상</h2>
            </div>

            <div className='vpContent'>
                <div className='vpPlaceholder'>
                    <span className='vpIcon'>▶</span>
                </div>
                <p className='vpText'>영상이 표시되는 영역입니다.</p>
            </div>
        </section>
    )
}

export default VideoPlayer