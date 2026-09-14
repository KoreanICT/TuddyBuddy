import React, { useState } from 'react'
import style from './videoSummary.module.css'

// 
interface videoUploadProps {
    videoClick: (value: boolean) => void;
    youtubeClick: (value: boolean) => void;
}

const VideoUpload: React.FC<videoUploadProps> = (props) => {

    const [isopen, setIsopen] = useState(false);

    return (
        <section className={style.vUpload}>
            <div className={style.vuContent}>
                <div className={style.vuIcon}>
                    🎬
                </div>
                <h1 className={style.vuTitle}>영상을 업로드 해주세요.</h1>
                <p className={style.vuDescription}>영상을 업로드하면 내용을 요약해 드립니다.</p>
                <div className={style.vuDropdown}>
                    <button
                        type='button'
                        className={style.vuButton}
                        onClick={() => setIsopen(!isopen)}>영상 업로드</button>
                    {isopen && (
                        <div className={style.vuDropdownMenu}>
                            <button
                                type='button'
                                className={style.vuButton}
                                onClick={() => props.videoClick(true)}>파일 업로드</button>
                            <button
                                type='button'
                                className={style.vuButton}
                                onClick={() => props.youtubeClick(true)}>YouTube 링크</button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default VideoUpload