import React, { useState } from 'react';
import styles from './studyManagement.module.css';

type StudyStatus =
    | 'ACTIVE'
    | 'CLOSED'
    | 'SUSPENDED';

type StudyType =
    | 'PUBLIC'
    | 'PRIVATE';

interface Study {
    id: number;
    title: string;
    leader: string;
    type: StudyType;
    currentMembers: number;
    maxMembers: number;
    status: StudyStatus;
    createdAt: string;
}

const StudyManagement: React.FC = () => {

    const [studies, setStudies] = useState<Study[]>([
        {
            id: 1,
            title: '정보처리기사 같이 공부해요',
            leader: '홍길동',
            type: 'PUBLIC',
            currentMembers: 5,
            maxMembers: 8,
            status: 'ACTIVE',
            createdAt: '2026-09-10',
        },
        {
            id: 2,
            title: '매일 알고리즘 스터디',
            leader: '김철수',
            type: 'PUBLIC',
            currentMembers: 6,
            maxMembers: 6,
            status: 'ACTIVE',
            createdAt: '2026-09-09',
        },
        {
            id: 3,
            title: '토익 900점 목표',
            leader: '이영희',
            type: 'PRIVATE',
            currentMembers: 3,
            maxMembers: 5,
            status: 'CLOSED',
            createdAt: '2026-09-08',
        },
        {
            id: 4,
            title: 'Spring Boot 프로젝트',
            leader: '박민수',
            type: 'PUBLIC',
            currentMembers: 4,
            maxMembers: 8,
            status: 'ACTIVE',
            createdAt: '2026-09-07',
        },
        {
            id: 5,
            title: 'React 같이 공부하실 분',
            leader: '최지훈',
            type: 'PUBLIC',
            currentMembers: 2,
            maxMembers: 6,
            status: 'SUSPENDED',
            createdAt: '2026-09-06',
        },
    ]);

    const [filter, setFilter] =
        useState<'ALL' | StudyStatus>('ALL');

    const [keyword, setKeyword] = useState('');

    const changeStatus = (
        id: number,
        status: StudyStatus
    ) => {

        setStudies(prev =>
            prev.map(study =>
                study.id === id
                    ? { ...study, status }
                    : study
            )
        );
    };

    const filteredStudies = studies.filter(study => {

        const statusMatch =
            filter === 'ALL' ||
            study.status === filter;

        const keywordMatch =
            study.title
                .toLowerCase()
                .includes(keyword.toLowerCase()) ||
            study.leader
                .toLowerCase()
                .includes(keyword.toLowerCase());

        return statusMatch && keywordMatch;
    });

    const getStatusText = (status: StudyStatus) => {

        switch (status) {
            case 'ACTIVE':
                return '운영 중';

            case 'CLOSED':
                return '종료';

            case 'SUSPENDED':
                return '정지';

            default:
                return status;
        }
    };

    return (
        <div className={styles.study}>

            <div className={styles.header}>
                <h1>스터디 관리</h1>
                <p>
                    생성된 스터디를 조회하고 관리할 수 있습니다.
                </p>
            </div>

            {/* 상태 필터 */}
            <div className={styles.filter}>

                <button
                    className={
                        filter === 'ALL'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => setFilter('ALL')}
                >
                    전체
                </button>

                <button
                    className={
                        filter === 'ACTIVE'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => setFilter('ACTIVE')}
                >
                    운영 중
                </button>

                <button
                    className={
                        filter === 'CLOSED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => setFilter('CLOSED')}
                >
                    종료
                </button>

                <button
                    className={
                        filter === 'SUSPENDED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => setFilter('SUSPENDED')}
                >
                    정지
                </button>

            </div>

            {/* 검색 */}
            <div className={styles.search}>

                <input
                    type="text"
                    placeholder="스터디명 또는 방장 검색"
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(e.target.value)
                    }
                />

                <button type="button">
                    검색
                </button>

            </div>

            {/* 테이블 */}
            <div className={styles.tableWrapper}>

                <table className={styles.table}>

                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>스터디명</th>
                            <th>방장</th>
                            <th>공개 여부</th>
                            <th>인원</th>
                            <th>상태</th>
                            <th>생성일</th>
                            <th>관리</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredStudies.length > 0 ? (
                            filteredStudies.map(study => (
                                <tr key={study.id}>
                                    <td>{study.id}</td>
                                    <td className={styles.studyTitle}>
                                        {study.title}
                                    </td>
                                    <td>{study.leader}</td>
                                    <td>
                                        {study.type === 'PUBLIC'
                                            ? '공개'
                                            : '비공개'}
                                    </td>
                                    <td>
                                        {study.currentMembers}
                                        /
                                        {study.maxMembers}
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.status} ${
                                                styles[
                                                    study.status.toLowerCase()
                                                ]
                                            }`}
                                        >{getStatusText(study.status)}
                                        </span>
                                    </td>
                                    <td>{study.createdAt}</td>
                                    <td>
                                        <select
                                            className={styles.select}
                                            value={study.status}
                                            onChange={(e) => changeStatus(study.id, e.target.value as StudyStatus)
                                            }>
                                            <option value="ACTIVE">운영 중</option>
                                            <option value="CLOSED">종료</option>
                                            <option value="SUSPENDED">정지</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className={styles.empty}>조회된 스터디가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudyManagement;