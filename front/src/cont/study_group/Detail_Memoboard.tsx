import React from 'react'
import styles from './detail.module.css'
import { Detail_MemoCard } from './Detail_MemoCard'

interface MemoData {
    title: string,
    writer: string,
    content?: string, 
    created_at: string,
    updated_at?: string
}
export const Detail_Memoboard: React.FC = () => {
    
    const Memo:MemoData[] = [
        {
            title: '집가고 싶다',
            writer: '진석',
            content: '왜 오늘 이렇게 시간 늦게 가냐', 
            created_at: '2026.09.22 11:20'
        },
        {
            title: '왤케 졸리냐',
            writer: '진석',
            content: '집가자마자 잘듯', 
            created_at: '2026.09.22 13:15',
            updated_at: '2026.09.22 14:33'
        },
        {
            title: 'Hahahaha!! you lost!!!',
            writer: 'NNN',
            content: 'From now on this sector is taken over by Nullifying Nuke Nuts!!!', 
            created_at: '2026.09.22 17:56'
        }
    ]
    return (
        <div>
            <h3>안녕하세요 여기는 보드 역할입니다.</h3>
            <ul>
                {Memo.map((data) => (
                    <li>
                        <div>
                            <Detail_MemoCard 
                                title={data.title}
                                writer={data.writer}
                                content={data.content}
                                created_at={data.created_at}
                                updated_at={data.updated_at}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

