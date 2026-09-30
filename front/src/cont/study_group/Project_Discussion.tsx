import React from 'react'
import styles from './project.module.css'
interface QuestionList {
    questionid: number,
    groupid: number,
    memberid: number,
    created_at: string,
    updated_at: string,
    document_type: string,

}

interface QuestionDetail {

}

const Project_Discussion: React.FC = () => {

    
    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>질의응답</h3>
                <p className={styles.section_desc}>
                    멤버들이 공부를 하던 중 생긴 질문을 올리고 그에 대한 답변을 올리는 곳입니다.
                </p>
            </div>
        </div>
    )
}

export default Project_Discussion