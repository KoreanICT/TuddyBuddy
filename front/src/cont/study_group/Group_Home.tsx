import React, { useState } from 'react';
import { Group_Sidebar } from './Group_Sidebar';
import { Group_Private } from './Group_Private';
import { Group_Public } from './Group_Public';
import styles from './group.module.css';

export const Group_Home: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<'public' | 'my'>('public');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    // 사이드바 공통 검색 상태
    const [searchType, setSearchType] = useState<'name' | 'tag'>('name');
    const [searchTerm, setSearchTerm] = useState<string>('');

    return (
        <div className="container">
            <div className={styles.study_page_layout}>
                {/* 1. 좌측 렌더링 영역 (탭 선택에 따라 자식 컴포넌트 교체) */}
                {currentTab === 'my' ? (
                    <Group_Private searchType={searchType} searchTerm={searchTerm} />
                ) : (
                    <Group_Public searchType={searchType} searchTerm={searchTerm} />
                )}

                {/* 2. 우측 고정 사이드바 */}
                <Group_Sidebar
                    currentTab={currentTab}
                    onTabChange={(tab) => setCurrentTab(tab)}
                    onOpenCreateModal={() => setIsModalOpen(true)}
                    searchType={searchType}
                    onSearchTypeChange={(type) => setSearchType(type)}
                    searchTerm={searchTerm}
                    onSearchChange={(value) => setSearchTerm(value)}
                />

                {/* 3. 스터디룸 생성 모달 */}
                {isModalOpen && (
                    <div className={styles.study_modal_overlay} onClick={() => setIsModalOpen(false)}>
                        <div className={styles.study_modal_box} onClick={(e) => e.stopPropagation()}>
                            <h2>스터디룸 생성</h2>
                            <p>스터디 이름 및 정원(5명, 10명 등) 설정 폼 영역입니다.</p>
                            <button
                                className={styles.study_modal_close_btn}
                                onClick={() => setIsModalOpen(false)}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};