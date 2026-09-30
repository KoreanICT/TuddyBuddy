import React from 'react'
import { TDLData } from './GroupAPI'
import styles from './project.module.css'

export const Project_TDL: React.FC = () => {

    const tdlDummy:TDLData[] = [
        {
            tdlid: 1,
            groupid: 1,
            stepid: 1,
            creator: '주판다',
            appointee: '보노보노',
            title: 'PC방 가기',
            detail: '이터널리턴 하기',
            status: 'In Progressing',
            created_at: '2026.09.27',
            started_at: '2026.09.28',
            expired_at: '2026.09.30',
        },
    ]

    return (
        <div>
            {tdlDummy.map((data, id) => (
                <div className={styles.project_tdl_card}>
                    <p>{data.title}</p>
                    <p>{data.status}</p>
                </div>
            ))}
        </div>
    )
}

