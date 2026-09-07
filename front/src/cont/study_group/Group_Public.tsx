import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './group.module.css';

interface GroupPublicProps {
    searchType: 'name' | 'tag';
    searchTerm: string;
}

interface StudyItem {
    id: number;
    title: string;
    description: string;
    tags: string[];
    currentMembers: number;
    maxCapacity: number;
}

const mockPublicStudies: StudyItem[] = [
    {
        id: 101,
        title: '프론트엔드 CSS 지식 면접 대비반',
        description: '면접 대비 CSS 공부',
        tags: ['CSS', '면접', 'React'],
        currentMembers: 3,
        maxCapacity: 5,
    },
    {
        id: 102,
        title: '커뮤니티 토이 프로젝트',
        description: 'React + Spring Boot 커뮤니티 포트폴리오 스터디',
        tags: ['React', 'Spring', '프로젝트'],
        currentMembers: 10,
        maxCapacity: 10,
    },
    {
        id: 103,
        title: 'TypeScript 초보 모여라',
        description: '기초 문법 익히며 타입스크립트 고수가 되고 싶은 분들 환영',
        tags: ['TypeScript', '기초'],
        currentMembers: 12,
        maxCapacity: 20,
    },
];

export const Group_Public: React.FC<GroupPublicProps> = ({ searchType, searchTerm }) => {
    const filteredStudies = mockPublicStudies.filter((study) => {
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
                <h2>공개된 스터디룸 목록</h2>
            </div>

            <div className={styles.study_list_wrapper}>
                {filteredStudies.length > 0 ? (
                    filteredStudies.map((study) => {
                        const isFull = study.currentMembers >= study.maxCapacity;
                        return (
                            <div key={study.id} className={styles.study_card}>
                                <div className={styles.study_card_header}>
                                    <h3 className={styles.study_card_title}>{study.title}</h3>
                                </div>
                                <p className={styles.study_card_desc}>{study.description}</p>
                                <div className={styles.study_card_footer}>
                                    <div className={styles.study_tags}>
                                        {study.tags.map((tag, idx) => (
                                            <span key={idx} className={styles.study_tag}>#{tag}</span>
                                        ))}
                                    </div>
                                    <div className={styles.study_card_info}>
                                        <span className={`${styles.study_capacity} ${isFull ? 'full' : ''}`}>
                                            인원: {study.currentMembers} / {study.maxCapacity}명
                                        </span>
                                        <button
                                            className={`${styles.study_action_btn} ${isFull ? `${styles.disabled}` : `${styles.primary}`}`}
                                            disabled={isFull}
                                            onClick={()=>{alert("참여 신청 완료.")}}
                                        >
                                            {isFull ? '정원 초과' : '참여하기'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="study-empty-card">
                        조회된 공개 스터디룸이 없습니다.
                    </div>
                )}
            </div>
        </section>
    );
};