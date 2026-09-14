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
            detail: '시험 합격 프로젝트'
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

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const openhandler = () => {
        if (isOpen === false) {
            setIsOpen(true);
        }
        else if (isOpen === true) {
            setIsOpen(false);
        }
    }
    return (
        <aside className={styles.detail_sidebar_container}>
            <nav className={styles.detail_menu_box}>
                <button
                    className={`${styles.detail_menu_button}`}
                    onClick={() => openhandler()}
                >
                    메뉴
                </button>
                {isOpen || sidebarContent.map((e) => (
                    <>
                        <div className={styles.detail_menu_divider} />
                        <button
                            className={`${styles.detail_menu_button} ${currentTab === e.alias ? styles.active : ''}`}
                            onClick={() => onTabChange(e.alias)}
                        >
                            {e.detail}
                        </button>
                    </>
                ))}
            </nav>
        </aside>
    );
};