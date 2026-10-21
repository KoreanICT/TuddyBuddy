//작성자 : 오진석
import React from 'react'
import styles from './project.module.css'
import { GetGroupNum } from './GroupAPI'

interface QuestionList {
    questionid: number,
    groupid: number,
    memberid: number,
    created_at: string,
    updated_at: string,
    document_type: string,

}

export const Project_Discussion: React.FC<GetGroupNum> = ({ groupNum }) => {

    
    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>Q&A</h3>
                <p className={styles.section_desc}>
                    멤버들이 공부를 하던 중 생긴 질문과 그에 대한 답변을 자유롭게 나누는 곳입니다.
                </p>
            </div>
        </div>
    )
}