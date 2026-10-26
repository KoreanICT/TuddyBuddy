import api from './api';
//작성자 : 오진석
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Detail_Sidebar } from './Detail_Sidebar';
import { DetailTab } from './Type';
import { Detail_Overview } from './Detail_Overview';
import { Detail_Memo } from './Detail_Memo';
import styles from './detail.module.css';
import { Detail_Member } from './Detail_Member';
import { GiHamburgerMenu } from 'react-icons/gi';
import { FiSettings } from 'react-icons/fi';
import { Project_Calendar } from './Project_Calendar';
import { Project_Discussion } from './Project_Discussion';
import { Project_Course } from './Project_Course';
import { Detail_Document } from './Detail_Document';
import { Project_TDL } from './Project_TDL';
import { getFirstLetter } from './GroupAPI';
import { Group_EditModal } from './Group_Edit';
import ReportButton from '../report/ReportButton';

interface GroupHeaderData {
    group_title: string;
    group_desc: string;
    group_thumbnail: string | null;
    is_leader: number;
}

export const Group_Detail: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<DetailTab>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [groupData, setGroupData] = useState<GroupHeaderData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // 메뉴 바깥 클릭 감지를 위한 ref
    const menuRef = useRef<HTMLDivElement>(null);

    const { groupNum } = useParams<{ groupNum: string }>();
    const parsedGroupNum = Number(groupNum);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);

    const loadGroupDetail = async () => {
        if (!groupNum) {
            return;
        }
        const parsed = Number(groupNum);
        if (Number.isNaN(parsed)) {
            return;
        }
        try {
            const response = await api.get(
                `/group/detail/${parsed}`
            )
            setGroupData(response.data);
        } catch (error) {
            console.error('스터디룸 상세 조회 실패', error);
        }
    };

    useEffect(() => {
        loadGroupDetail();
    }, [groupNum]);

    const handleTabChange = (tab: DetailTab) => {
        setCurrentTab(tab);

        setIsSidebarOpen(false);
    }

    if (!groupNum || Number.isNaN(parsedGroupNum)) {
        return <div>잘못된 스터디룸 번호입니다.</div>;
    }
    return (
        <div className="container">
            {/* 1. 상단 목록으로 돌아가기 버튼 (입장하기 버튼과 동일 서식) */}
            <div className={styles.top_navigation}>
                <NavLink
                    to="/group"
                    className={`${styles.action_btn} ${styles.primary}`}
                >
                    스터디 목록으로 돌아가기
                </NavLink>
            </div>

            {/* 2. 메인 디테일 레이아웃 */}
            <div className={styles.detail_page_layout}>
                {/* 좌측 메인 콘텐츠 영역 */}
                <main className={styles.detail_main_content}>
                    {/* 상단 고정: 스터디 프로필 헤더 (탭이 변경되어도 유지는 영역) */}
                    <div className={styles.group_header_card}>
                        <div className={styles.group_icon}>
                            {groupData?.group_thumbnail ? (
                                <img src={`http://localhost/back/api/group/thumbnail/${encodeURIComponent(
                                    groupData.group_thumbnail
                                )}`} alt="" className={styles.study_thumbnail_img} />
                            ) : (
                                getFirstLetter(groupData?.group_title ?? '')
                            )}
                        </div>
                        <div className={styles.group_header_info}>
                            <h1 className={styles.group_title}>{groupData?.group_title}</h1>
                            <p className={styles.group_desc}>{groupData?.group_desc}</p>
                        </div>
                        <div className={styles.header_menu_wrapper} ref={menuRef}>
                            {groupData && (
                                <ReportButton type="study" targetNum={parsedGroupNum}
                                    aria-label="스터디 신고">신고</ReportButton>
                            )}
                            {groupData?.is_leader === 1 && (
                                <button
                                    type="button"
                                    className={styles.header_menu_btn}
                                    onClick={() => setIsEditModalOpen(true)}
                                    aria-label="스터디룸 설정"
                                >
                                    {FiSettings({})}
                                </button>
                            )}
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

                    {isEditModalOpen && (
                        <Group_EditModal
                            groupNum={parsedGroupNum}
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            onUpdated={() => {
                                setIsEditModalOpen(false);
                                loadGroupDetail();
                            }}
                        />
                    )}
                    {/* 하단 탭 교체 영역 */}
                    {currentTab === 'overview' && <Detail_Overview groupNum={parsedGroupNum} />}
                    {currentTab === 'memo' && <Detail_Memo groupNum={parsedGroupNum} />}
                    {currentTab === 'member' && <Detail_Member groupNum={parsedGroupNum} />}
                    {currentTab === 'calendar' && <Project_Calendar groupNum={parsedGroupNum} />}
                    {currentTab === 'board' && <Project_TDL groupNum={parsedGroupNum} />}
                    {currentTab === 'discussion' && <Project_Discussion groupNum={parsedGroupNum} />}
                    {currentTab === 'course' && <Project_Course groupNum={parsedGroupNum}  isLeader={groupData?.is_leader === 1} />}
                    {currentTab === 'document' && <Detail_Document groupNum={parsedGroupNum} />}
                </main>
            </div>
        </div>
    );
};
