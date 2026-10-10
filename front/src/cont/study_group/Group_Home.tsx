import React, { useState } from 'react';
import { Group_Sidebar } from './Group_Sidebar';
import { Group_List } from './Group_List';
import styles from './group.module.css';
import { Group_Create } from './Group_Create';

export const Group_Home: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<'public' | 'my'>('my');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    // 사이드바 공통 검색 상태
    const [searchType, setSearchType] = useState<'name' | 'tag'>('name');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const openCreateModal = () => setIsModalOpen(true);
    const closeCreateModal = () => setIsModalOpen(false);

    return (
        <div className="container">

            <div className={styles.study_section_header}>
                <h2>{currentTab === 'my' ? '내 스터디룸 목록' : '공개된 스터디룸 목록'}</h2>
                <p>원하는 스터디룸에 참여해 다른 사람들과 같이 공부해봅시다.</p>
            </div>

            <div className={styles.study_page_layout}>
                {/* 1. 좌측 렌더링 영역 (탭 선택에 따라 자식 컴포넌트 교체) */}
                <Group_List mode={currentTab} searchType={searchType} searchTerm={searchTerm} />

                {/* 2. 우측 고정 사이드바 */}
                <Group_Sidebar
                    currentTab={currentTab}
                    onTabChange={(tab) => setCurrentTab(tab)}
                    onOpenCreateModal={openCreateModal}
                    searchType={searchType}
                    onSearchTypeChange={(type) => setSearchType(type)}
                    searchTerm={searchTerm}
                    onSearchChange={(value) => setSearchTerm(value)}
                    onOpenInviteModal={() => setIsInviteModalOpen(true)}
                />

                {/* 3. 스터디룸 생성 모달 */}
                {isModalOpen && (
                    <div className={styles.study_modal_overlay} onClick={() => setIsModalOpen(false)}>
                        <div className={styles.study_modal_box} onClick={(e) => e.stopPropagation()}>
                            
                            <Group_Create isOpen={isModalOpen} onClose={closeCreateModal} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};