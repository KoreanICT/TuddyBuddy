import React from 'react';
import styles from './detail.module.css';
import { DetailSidebarProps, SidebarDirection } from './GroupAPI';

export const Detail_Sidebar: React.FC<DetailSidebarProps> = ({ currentTab, onTabChange, mode='sidebar'}) => {

    const sidebarContent: SidebarDirection[] = [
        {
            id: 1,
            alias: 'overview',
            detail: '개요'
        },
        {
            id: 2,
            alias: 'image',
            detail: '이미지 업로드 및 문제 풀이'
        },
        {
            id: 3,
            alias: 'board',
            detail: '해야할 일'
        },
        {
            id: 4,
            alias: 'course',
            detail: '진행 다이어그램'
        },
        {
            id: 5,
            alias: 'calendar',
            detail: '일정'
        },
        {
            id: 6,
            alias: 'document',
            detail: '참고 자료'
        },
        {
            id: 7,
            alias: 'discussion',
            detail: '질의응답'
        },
        {
            id: 8,
            alias: 'member',
            detail: '멤버 목록'
        },
        {
            id: 9,
            alias: 'memo',
            detail: '메모'
        }
    ]

    return (
        <aside className={mode === 'dropdown' ? styles.detail_sidebar_dropdown : styles.detail_sidebar_container}>
            <nav className={styles.detail_menu_box}>
                {sidebarContent.map((e, index) => (
                    <React.Fragment key={e.id}>
                        {index !== 0 && (
                            <div className={styles.detail_menu_divider} />
                        )}
                        <button
                            className={`${styles.detail_menu_button} ${currentTab === e.alias ? styles.active : ''}`}
                            onClick={() => onTabChange(e.alias)}
                        >
                            {e.detail}
                        </button>
                    </React.Fragment>
                ))}
            </nav>
        </aside>
    );
};