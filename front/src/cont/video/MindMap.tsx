import React from 'react'

const MindMap: React.FC = () => {
    return (
        <section className='mindMap'>
            <div className='mmHeader'>
                <span className='mmLabel'>
                    MIND MAP
                </span>
                <h2 className='mmTitle'>
                    마인드맵
                </h2>
            </div>
            <div className='mmContent'>
                <div className='mmCenter'>
                    Python
                </div>
                <div className='mmNode mmTop'>
                    내용 1
                </div>
                <div className='mmNode mmLeft'>
                    내용 2
                </div>
                <div className='mmNode mmRight'>
                    내용 3
                </div>
                <div className='mmNode mmBottom'>
                    내용 4
                </div>
            </div>
        </section>
    )
}

export default MindMap