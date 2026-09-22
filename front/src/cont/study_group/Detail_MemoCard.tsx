import React from 'react'
import styles from './detail.module.css'

interface MemoCardProp {
    title: string,
    writer: string,
    content?: string,
    created_at: string,
    updated_at?: string
}

export const Detail_MemoCard: React.FC<MemoCardProp> = ({title, writer, content, created_at, updated_at}) => {

    

    return (
        <div>
            <div>
                <p>제목 : {title}</p>
                <p>글쓴이 : {writer}</p>
            </div>
            <div>
                <p>내용 : {content}</p>
                <p>등록 날짜 : {created_at}</p>
                {!updated_at ? <></> : <p>수정 날짜 : {updated_at}</p>}
            </div>
        </div>
    )
}

