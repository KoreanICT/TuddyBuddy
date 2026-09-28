import React from 'react'
import { TabbarDirection } from './ProjectAPI';
import { ProjectTab } from '../study_group/Type';
import styles from './project.module.css'

interface TabMenuProps {
    currentTab: ProjectTab;
    onTabChange: (tab: ProjectTab) => void;
}
export const Project_Tabmenu: React.FC<TabMenuProps> = ({ currentTab, onTabChange}) => {

    const tabbarContent: TabbarDirection[] = [
        {
            id: 1,
            alias: 'overview',
            detail: '개요'
        },
        {
            id: 2,
            alias: 'board',
            detail: '보드'
        },
        {
            id: 3,
            alias: 'calendar',
            detail: '달력'
        },
        {
            id: 4,
            alias: 'course',
            detail: '단계'
        },
        {
            id: 5, 
            alias: 'discussion',
            detail: '토론실'
        }
    ]

    return (
        <aside>
            <nav>
                {tabbarContent.map((e, index) => (
                    <React.Fragment key={e.id}>
                        {index !== 0 && (
                            <div className={styles.project_menu_divider} />
                        )}
                        <button
                            onClick={() => onTabChange(e.alias)}
                        >
                            {e.detail}
                        </button>
                    </React.Fragment>
                ))}
            </nav>
        </aside>
    )
}
