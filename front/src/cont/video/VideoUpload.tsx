import React from 'react'


const VideoUpload: React.FC = () => {
    return (
        <section className='vUpload'>
            <div className='vuContent'>
                <div className='vuIcon'>
                    🎬
                </div>
                <h1 className='vuTitle'>영상을 업로드 해주세요.</h1>
                <p className='vuDescription'>영상을 업로드하면 내용을 요약해 드립니다.</p>
                <button type='button' className='vuButton'>영상 선택</button>
            </div>
        </section>
    )
}

export default VideoUpload