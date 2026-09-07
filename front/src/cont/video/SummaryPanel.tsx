import React from 'react'

const SummaryPanel: React.FC = () => {
    return (
        <section className="sPanel">
            <div className="spHeader">
                <span className="spLabel">
                    AI SUMMARY
                </span>

                <h2 className="spTitle">
                    영상 요약
                </h2>
            </div>

            <div className="spContent">
                <section className="sSection">
                    <h3 className='ssTitle'>
                        핵심 내용
                    </h3>
                    <p className='ssText'>
                        업로드된 영상의 핵심내용
                    </p>
                </section>

                <section className="sSection">
                    <h3 className='ssTitle'>
                        주요 키워드
                    </h3>
                    <div className='skList'>
                        <span className='sKeyword'>내용1</span>
                        <span className='sKeyword'>내용2</span>
                        <span className='sKeyword'>내용3</span>
                        <span className='sKeyword'>내용4</span>
                    </div>
                </section>

                <section className="sSection">
                    <h3 className='ssTitle'>
                        주요 내용
                    </h3>
                    <ul className='sList'>
                        <li className='slItem'>
                            <span className='slItem'>
                                00:00
                            </span>
                            <p>1. 첫번째</p>
                        </li>
                        <li className='slItem'>
                            <span className='slItem'>
                                00:00
                            </span>
                            <p>2. 두번째</p>
                        </li>
                        <li className='slItem'>
                            <span className='slItem'>
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