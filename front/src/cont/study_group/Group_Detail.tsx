import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Detail_Sidebar, DetailTab } from './Detail_Sidebar';
import { Detail_Overview } from './Detail_Overview';
import { Detail_Memo } from './Detail_Memo';
import styles from './detail.module.css';
import { Detail_Image } from './Detail_Image';
import { Detail_Member } from './Detail_Member';
import { Detail_Project } from './Detail_Project';
import VideoSummary from '../video/VideoSummary';
import { GiHamburgerMenu } from "react-icons/gi";

interface GroupDetailProps {
    onBackToHome?: () => void;
}

export const Group_Detail: React.FC<GroupDetailProps> = ({ onBackToHome }) => {
    const [currentTab, setCurrentTab] = useState<DetailTab>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    // 메뉴 바깥 클릭 감지를 위한 ref
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);

    const handleTabChange = (tab: DetailTab) => {
        setCurrentTab(tab);

        setIsSidebarOpen(false);
    }
    return (
        <div className="container">
            {/* 1. 상단 목록으로 돌아가기 버튼 (입장하기 버튼과 동일 서식) */}
            <div className={styles.top_navigation}>
                {onBackToHome ? (
                    <button
                        className={`${styles.action_btn} ${styles.primary}`}
                        onClick={onBackToHome}
                    >
                        스터디 목록으로 돌아가기
                    </button>
                ) : (
                    <NavLink
                        to="/homegroup"
                        className={`${styles.action_btn} ${styles.primary}`}
                    >
                        스터디 목록으로 돌아가기
                    </NavLink>
                )}
            </div>

            {/* 2. 메인 디테일 레이아웃 */}
            <div className={styles.detail_page_layout}>
                {/* 좌측 메인 콘텐츠 영역 */}
                <main className={styles.detail_main_content}>
                    {/* 상단 고정: 스터디 프로필 헤더 (탭이 변경되어도 유지는 영역) */}
                    <div className={styles.group_header_card}>
                        <div className={styles.group_icon}>프</div>
                        <div className={styles.group_header_info}>
                            <h1 className={styles.group_title}>프론트엔드 CSS 지식 면접 대비반</h1>
                            <p className={styles.group_desc}>면접 대비 CSS 공부</p>
                        </div>
                        <div className={styles.header_menu_wrapper} ref={menuRef}>
                            <button
                                type="button"
                                className={styles.header_menu_btn}
                                onClick={() => setIsSidebarOpen(prev => !prev)}
                                aria-label="스터디 상세 메뉴"
                                aria-expanded={isSidebarOpen}
                            >
                                {GiHamburgerMenu({})}
                            </button>
                            {/* 우측 전용 사이드바 */}
                            {isSidebarOpen && (
                                <div className={styles.header_dropdown}>
                                    <Detail_Sidebar
                                        currentTab={currentTab}
                                        onTabChange={handleTabChange}
                                        mode="dropdown"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 하단 탭 교체 영역 */}
                    {currentTab === 'overview' && <Detail_Overview />}
                    {currentTab === 'video' && <VideoSummary />}
                    {currentTab === 'image' && <Detail_Image />}
                    {currentTab === 'memo' && <Detail_Memo />}
                    {currentTab === 'member' && <Detail_Member />}
                    {currentTab === 'project' && <Detail_Project />}
                </main>

                

            </div>
        </div>
    );
};