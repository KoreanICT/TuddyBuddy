import React from 'react';
import styles from './group.module.css';

interface GroupSidebarProps {
    currentTab: 'public' | 'my';
    onTabChange: (tab: 'public' | 'my') => void;
    onOpenCreateModal: () => void;
    searchType: 'name' | 'tag';
    onSearchTypeChange: (type: 'name' | 'tag') => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export const Group_Sidebar: React.FC<GroupSidebarProps> = ({
    currentTab,
    onTabChange,
    onOpenCreateModal,
    searchType,
    onSearchTypeChange,
    searchTerm,
    onSearchChange,
}) => {
    return (
        <aside className={styles.study_sidebar_container}>
            {/* 1. 메뉴 둥근 사각형 박스 (3가지 메뉴만 포함) */}
            <nav className={styles.study_menu_box}>
                <button
                    className={`${styles.study_menu_button} ${currentTab === 'my' ? `${styles.active}` : ''}`}
                    onClick={() => onTabChange('my')}
                >
                    내 스터디룸
                </button>

                <div className={styles.study_menu_divider} />

                <button
                    className={`${styles.study_menu_button} ${currentTab === 'public' ? `${styles.active}` : ''}`}
                    onClick={() => onTabChange('public')}
                >
                    공개된 스터디룸
                </button>

                <div className={styles.study_menu_divider} />

                <button
                    className={styles.study_menu_button}
                    onClick={onOpenCreateModal}
                >
                    스터디룸 생성
                </button>
            </nav>

            {/* 2. 메뉴 박스 '밖 아래'에 배치된 드롭다운 통합 검색 박스 */}
            <div className={styles.sidebar_search_box}>
                <select
                    className={styles.sidebar_search_select}
                    value={searchType}
                    onChange={(e) => onSearchTypeChange(e.target.value as 'name' | 'tag')}
                >
                    <option value="name">이름으로 검색</option>
                    <option value="tag">태그로 검색</option>
                </select>
                
                <input
                    type="text"
                    placeholder="검색어 입력"
                    className={styles.sidebar_search_input}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </aside>
    );
};