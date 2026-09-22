import React from 'react'
import styles from '../study_group/detail.module.css'

export const Project_Home: React.FC = () => {
    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>목표 달성 프로젝트</h3>
                <p className={styles.section_desc}>
                    각자가 원하는 목표 달성을 위해 여러 정보를 공유하는 공간입니다. 
                </p>
            </div>
        </div>
    )
}            