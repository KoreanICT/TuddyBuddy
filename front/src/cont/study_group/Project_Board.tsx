import React from 'react'
import styles from './project.module.css'
export const Project_Board: React.FC = () => {


    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>해야할 일</h3>
                <p className={styles.section_desc}>
                    각자가 해야할 일을 일일별로 등록하거나, 멤버별로 등록할 수 있는 공간입니다.
                </p>
            </div>
        </div>
    )
}

