import React from 'react';
import { NavLink } from 'react-router-dom';
//import Group_Detail from './Group_Detail';
import styles from './group.module.css';

interface GroupPrivateProps {
    searchType: 'name' | 'tag';
    searchTerm: string;
}

// 예시 데이터 구조
interface StudyItem {
    id: number;
    title: string;
    description: string;
    tags: string[];
    currentMembers: number;
    maxCapacity: number;
    role: string;
}

const mockPrivateStudies: StudyItem[] = [
    {
        id: 1,
        title: '알고리즘 문제 풀이 스터디',
        description: '매주 백준/프로그래머스 골드 이상 문제 3개씩 풀고 리뷰합니다.',
        tags: ['React', 'TypeScript', '알고리즘'],
        currentMembers: 4,
        maxCapacity: 5,
        role: '방장',
    },
    {
        id: 2,
        title: 'Spring Boot & Oracle DB 토이 프로젝트',
        description: '실무 대비 REST API 및 DB 트랜잭션 설계 집중 스터디',
        tags: ['Spring', 'Java', 'Oracle'],
        currentMembers: 8,
        maxCapacity: 10,
        role: '팀원',
    },
];

export const Group_Private: React.FC<GroupPrivateProps> = ({ searchType, searchTerm }) => {
    // 사이드바의 검색어 입력에 따른 필터링
    const filteredStudies = mockPrivateStudies.filter((study) => {
        if (!searchTerm.trim()) return true;
        if (searchType === 'name') {
            return study.title.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
            return study.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        }
    });

    return (
        <section className={styles.study_main_content}>
            <div className={styles.study_section_header}>
                <h2>내 스터디룸 목록</h2>
            </div>

            <div className={styles.study_list_wrapper}>
                {filteredStudies.length > 0 ? (
                    filteredStudies.map((study) => (
                        <div key={study.id} className={styles.study_card}>
                            <div className={styles.study_card_header}>
                                <h3 className={styles.study_card_title}>{study.title}</h3>
                                <span className={`${styles.study_badge} ${styles.my_role}`}>{study.role}</span>
                            </div>
                            <p className={styles.study_card_desc}>{study.description}</p>
                            <div className={styles.study_card_footer}>
                                <div className={styles.study_tags}>
                                    {study.tags.map((tag, idx) => (
                                        <span key={idx} className={styles.study_tag}>#{tag}</span>
                                    ))}
                                </div>
                                <div className={styles.study_card_info}>
                                    <span className={styles.study_capacity}>
                                        인원: {study.currentMembers} / {study.maxCapacity}명
                                    </span>
                                    <NavLink
                                        to={`/group/detail`}
                                        className={`${styles.study_action_btn} ${styles.primary}`}
                                    >
                                        입장하기
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="study_empty_card">
                        조회된 내 스터디룸이 없습니다.
                    </div>
                )}
            </div>
        </section>
    );
};