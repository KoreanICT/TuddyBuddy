import React, { useState } from 'react';
import styles from './detail.module.css';

export type DetailTab = 'overview' | 'video' | 'image' | 'memo' | 'member' | 'project';

interface DetailSidebarProps {
    currentTab: DetailTab;
    onTabChange: (tab: DetailTab) => void;
}

interface SidebarDirection {
    id: number;
    alias: DetailTab;
    detail: string;
}

export const Detail_Sidebar: React.FC<DetailSidebarProps> = ({ currentTab, onTabChange }) => {

    const sidebarContent:SidebarDirection[] = [
        {
            id : 1,
            alias : 'overview',
            detail : '개요'
        },
        {
            id : 2,
            alias : 'video',
            detail : '동영상 업로드 및 요약'
        },
        {
            id : 3,
            alias : 'image',
            detail : '이미지 업로드 및 문제 풀이'
        },
        {
            id : 4,
            alias : 'project',
            detail : '시험 합격 프로젝트'
        },
        {
            id : 5,
            alias : 'member',
            detail : '멤버 목록'
        },
        {
            id : 6,
            alias : 'memo',
            detail : '메모'
        }
    ]

    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <aside className={styles.detail_sidebar_container}>
            <nav className={styles.detail_menu_box}>
                {isOpen ? sidebarContent.map((e) => (
                    <button
                        className={`${styles.detail_menu_button} ${currentTab === e.alias ? styles.active : ''}`}
                        onClick={() => onTabChange(e.alias)}
                    >
                        {e.detail}
                    </button>
                )) : 
                    <button
                        className={`${styles.detail_menu_button}`}
                        onClick={() => setIsOpen(true)}
                    >
                        메뉴
                    </button>
                }
                {/* <button
                    className={`${styles.detail_menu_button} ${currentTab === 'overview' ? styles.active : ''}`}
                    onClick={() => onTabChange('overview')}
                >
                    개요
                </button>

                <div className={styles.detail_menu_divider} />

                <button
                    className={`${styles.detail_menu_button} ${currentTab === 'video' ? styles.active : ''}`}
                    onClick={() => onTabChange('video')}
                >
                    동영상 업로드 및 요약
                </button>

                <div className={styles.detail_menu_divider} />

                <button
                    className={`${styles.detail_menu_button} ${currentTab === 'image' ? styles.active : ''}`}
                    onClick={() => onTabChange('image')}
                >
                    이미지 업로드 및 문제 풀이
                </button>

                <div className={styles.detail_menu_divider} />

                <button
                    className={`${styles.detail_menu_button} ${currentTab === 'project' ? styles.active : ''}`}
                    onClick={() => onTabChange('project')}
                >
                    시험 합격 프로젝트
                </button>

                <div className={styles.detail_menu_divider} />

                <button
                    className={`${styles.detail_menu_button} ${currentTab === 'member' ? styles.active : ''}`}
                    onClick={() => onTabChange('member')}
                >
                    멤버 목록
                </button>

                <div className={styles.detail_menu_divider} />

                <button
                    className={`${styles.detail_menu_button} ${currentTab === 'memo' ? styles.active : ''}`}
                    onClick={() => onTabChange('memo')}
                >
                    메모
                </button> */}
            </nav>
        </aside>
    );
};