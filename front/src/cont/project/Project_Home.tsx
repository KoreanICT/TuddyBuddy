import React, { useState } from 'react'
import styles from '../study_group/detail.module.css'
import { ProjectTab } from '../study_group/Type';
import { Project_Overview } from './Project_Overview';
import { Project_Board } from './Project_Board';
import { Project_Calendar } from './Project_Calendar';
import { Project_Course } from './Project_Course';
import Project_Discussion from './Project_Discussion';
import { Project_Tabmenu } from './Project_TabMenu';
export const Project_Home: React.FC = () => {

    const [currentTab, setCurrentTab] = useState<ProjectTab>('overview');

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>목표 달성 프로젝트</h3>
                <p className={styles.section_desc}>
                    각자가 원하는 목표 달성을 위해 여러 정보를 공유하는 공간입니다. 
                </p>
            </div>
            
            <Project_Tabmenu
                currentTab={currentTab}
                onTabChange={(tab) => setCurrentTab(tab)}
            />

            {currentTab === 'overview' && <Project_Overview />}
            {currentTab === 'board' && <Project_Board />}
            {currentTab === 'calendar' && <Project_Calendar />}
            {currentTab === 'course' && <Project_Course />}
            {currentTab === 'discussion' && <Project_Discussion />}
        </div>
    )
}            