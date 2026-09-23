import React, { useState } from 'react';
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
            alias: 'video',
            detail: '동영상 업로드 및 요약'
        },
        {
            id: 3,
            alias: 'image',
            detail: '이미지 업로드 및 문제 풀이'
        },
        {
            id: 4,
            alias: 'project',
            detail: '목표 달성 프로젝트'
        },
        {
            id: 5,
            alias: 'member',
            detail: '멤버 목록'
        },
        {
            id: 6,
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