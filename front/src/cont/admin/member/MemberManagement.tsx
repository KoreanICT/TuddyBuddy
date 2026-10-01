import React, { useState, useEffect } from 'react';
import styles from './memberManagement.module.css';

type MemberRole = 'USER' | 'ADMIN';

type MemberGrade =
    | 'BASIC'
    | 'SILVER'
    | 'GOLD'
    | 'VIP';

type MemberStatus =
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'WITHDRAWN';

interface Member {
    id: number;
    loginId: string;
    name: string;
    email: string;
    role: MemberRole;
    grade: MemberGrade;
    status: MemberStatus;
    joinDate: string;
}

// 등급별 할인율
const gradeDiscount: Record<MemberGrade, number> = {
    BASIC: 0,
    SILVER: 5,
    GOLD: 10,
    VIP: 15,
};

const MemberManagement: React.FC = () => {

    // 회원 데이터 (더미)

    const [members, setMembers] = useState<Member[]>([
        {
            id: 1,
            loginId: 'test01',
            name: '홍길동',
            email: 'test01@test.com',
            role: 'USER',
            grade: 'BASIC',
            status: 'ACTIVE',
            joinDate: '2026-08-27',
        },
        {
            id: 2,
            loginId: 'admin01',
            name: '관리자',
            email: 'admin@test.com',
            role: 'ADMIN',
            grade: 'VIP',
            status: 'ACTIVE',
            joinDate: '2026-08-26',
        },
        {
            id: 3,
            loginId: 'test02',
            name: '김철수',
            email: 'test02@test.com',
            role: 'USER',
            grade: 'SILVER',
            status: 'SUSPENDED',
            joinDate: '2026-08-25',
        },
        {
            id: 4,
            loginId: 'test03',
            name: '이영희',
            email: 'test03@test.com',
            role: 'USER',
            grade: 'GOLD',
            status: 'WITHDRAWN',
            joinDate: '2026-08-24',
        },
        {
            id: 5,
            loginId: 'test04',
            name: '박민수',
            email: 'test04@test.com',
            role: 'USER',
            grade: 'BASIC',
            status: 'ACTIVE',
            joinDate: '2026-08-23',
        },
        {
            id: 6,
            loginId: 'test05',
            name: '최지훈',
            email: 'test05@test.com',
            role: 'USER',
            grade: 'SILVER',
            status: 'ACTIVE',
            joinDate: '2026-08-22',
        },
        {
            id: 7,
            loginId: 'test06',
            name: '정수빈',
            email: 'test06@test.com',
            role: 'USER',
            grade: 'GOLD',
            status: 'ACTIVE',
            joinDate: '2026-08-21',
        },
        {
            id: 8,
            loginId: 'test07',
            name: '강민지',
            email: 'test07@test.com',
            role: 'USER',
            grade: 'VIP',
            status: 'ACTIVE',
            joinDate: '2026-08-20',
        },
        {
            id: 9,
            loginId: 'test08',
            name: '윤서준',
            email: 'test08@test.com',
            role: 'USER',
            grade: 'BASIC',
            status: 'SUSPENDED',
            joinDate: '2026-08-19',
        },
        {
            id: 10,
            loginId: 'test09',
            name: '한지우',
            email: 'test09@test.com',
            role: 'USER',
            grade: 'SILVER',
            status: 'ACTIVE',
            joinDate: '2026-08-18',
        },
        {
            id: 11,
            loginId: 'test10',
            name: '오준혁',
            email: 'test10@test.com',
            role: 'USER',
            grade: 'GOLD',
            status: 'ACTIVE',
            joinDate: '2026-08-17',
        },
        {
            id: 12,
            loginId: 'test11',
            name: '서예린',
            email: 'test11@test.com',
            role: 'USER',
            grade: 'VIP',
            status: 'ACTIVE',
            joinDate: '2026-08-16',
        },
        {
            id: 13,
            loginId: 'test12',
            name: '임도현',
            email: 'test12@test.com',
            role: 'USER',
            grade: 'BASIC',
            status: 'ACTIVE',
            joinDate: '2026-08-15',
        },
        {
            id: 14,
            loginId: 'test13',
            name: '김나연',
            email: 'test13@test.com',
            role: 'USER',
            grade: 'SILVER',
            status: 'ACTIVE',
            joinDate: '2026-08-14',
        },
        {
            id: 15,
            loginId: 'test14',
            name: '이준호',
            email: 'test14@test.com',
            role: 'USER',
            grade: 'GOLD',
            status: 'SUSPENDED',
            joinDate: '2026-08-13',
        },
        {
            id: 16,
            loginId: 'test15',
            name: '박서연',
            email: 'test15@test.com',
            role: 'USER',
            grade: 'VIP',
            status: 'ACTIVE',
            joinDate: '2026-08-12',
        },
        {
            id: 17,
            loginId: 'test16',
            name: '장현우',
            email: 'test16@test.com',
            role: 'USER',
            grade: 'BASIC',
            status: 'ACTIVE',
            joinDate: '2026-08-11',
        },
        {
            id: 18,
            loginId: 'test17',
            name: '송하윤',
            email: 'test17@test.com',
            role: 'USER',
            grade: 'SILVER',
            status: 'ACTIVE',
            joinDate: '2026-08-10',
        },
        {
            id: 19,
            loginId: 'test18',
            name: '조현준',
            email: 'test18@test.com',
            role: 'USER',
            grade: 'GOLD',
            status: 'ACTIVE',
            joinDate: '2026-08-09',
        },
        {
            id: 20,
            loginId: 'test19',
            name: '배수민',
            email: 'test19@test.com',
            role: 'USER',
            grade: 'VIP',
            status: 'ACTIVE',
            joinDate: '2026-08-08',
        },
        {
            id: 21,
            loginId: 'test20',
            name: '김도윤',
            email: 'test20@test.com',
            role: 'USER',
            grade: 'BASIC',
            status: 'ACTIVE',
            joinDate: '2026-08-07',
        },
        {
            id: 22,
            loginId: 'test21',
            name: '이서현',
            email: 'test21@test.com',
            role: 'USER',
            grade: 'SILVER',
            status: 'SUSPENDED',
            joinDate: '2026-08-06',
        },
        {
            id: 23,
            loginId: 'test22',
            name: '최현준',
            email: 'test22@test.com',
            role: 'USER',
            grade: 'GOLD',
            status: 'ACTIVE',
            joinDate: '2026-08-05',
        },
        {
            id: 24,
            loginId: 'test23',
            name: '정다은',
            email: 'test23@test.com',
            role: 'USER',
            grade: 'VIP',
            status: 'ACTIVE',
            joinDate: '2026-08-04',
        },
        {
            id: 25,
            loginId: 'test24',
            name: '윤지호',
            email: 'test24@test.com',
            role: 'USER',
            grade: 'BASIC',
            status: 'ACTIVE',
            joinDate: '2026-08-03',
        },
    ]);
    // 필터 / 검색 상태

    const [statusFilter, setStatusFilter] =
        useState<MemberStatus | 'ALL'>('ALL');

    const [search, setSearch] = useState('');
    // 페이지네이션

    // 한 페이지에 보여줄 회원 수
    const pageSize = 5;

    // 페이지 번호를 몇 개씩 보여줄지
    const pageGroupSize = 5;
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    // 회원 권한 수정

    const handleRoleChange = (
        id: number,
        role: MemberRole
    ) => {
        setMembers(prev =>
            prev.map(member =>
                member.id === id ? { ...member, role } : member
            )
        );
    };
    // 회원 등급 수정

    const handleGradeChange = (
        id: number,
        grade: MemberGrade
    ) => {
        setMembers(prev =>
            prev.map(member =>
                member.id === id ? { ...member, grade } : member
            )
        );
    };
    // 회원 상태 수정

    const handleStatusChange = (
        id: number,
        status: MemberStatus
    ) => {
        setMembers(prev =>
            prev.map(member => member.id === id ? { ...member, status }
                : member
            )
        );
    };

    // =========================
    // 회원 정보 적용
    // =========================

    const handleApply = (member: Member) => {

        // 탈퇴 처리 시 확인
        if (member.status === 'WITHDRAWN') {

            const confirmWithdraw = window.confirm(
                `${member.name} 회원을 탈퇴 처리하시겠습니까?`
            );

            if (!confirmWithdraw) {
                return;
            }
        }

        // TODO: 백엔드 API 연결
        console.log('회원 정보 수정:', member);

        alert('회원 정보가 적용되었습니다.');
    };
    // 검색 / 상태 필터

    const filteredMembers = members.filter(member => {

        // 상태 필터
        const matchStatus =
            statusFilter === 'ALL' ||
            member.status === statusFilter;

        // 검색
        const keyword = search.toLowerCase();

        const matchSearch =
            member.loginId.toLowerCase().includes(keyword) ||
            member.name.toLowerCase().includes(keyword) ||
            member.email.toLowerCase().includes(keyword);

        return matchStatus && matchSearch;
    });

    // =========================
    // 페이지 계산
    //
    // 나중에 백엔드에서
    // totalItems
    // totalPages
    // currentPage
    // startPage
    // endPage
    // 를 받아오면 이 부분을 제거하고
    // 백엔드 값을 사용하면 됨.
    // =========================

    useEffect(() => {

        const total = filteredMembers.length;

        const pages = Math.ceil(total / pageSize);

        setTotalItems(total);
        setTotalPages(pages);

        // 검색이나 필터링으로 현재 페이지가
        // 존재하지 않게 되는 경우 1페이지로 이동
        if (pages > 0 && currentPage > pages) {
            setCurrentPage(1);
        }

        // 페이지 그룹 계산
        const start =
            Math.floor((currentPage - 1) / pageGroupSize)
            * pageGroupSize + 1;

        const end =
            Math.min(
                start + pageGroupSize - 1,
                pages
            );

        setStartPage(start);
        setEndPage(end);

    }, [filteredMembers.length, currentPage]);

    // =========================
    // 현재 페이지 데이터
    // =========================

    const startIndex =
        (currentPage - 1) * pageSize;
    const endIndex =
        startIndex + pageSize;
    const currentMembers =
        filteredMembers.slice(
            startIndex,
            endIndex
        );

    // =========================
    // 페이지 변경
    // =========================

    const pageChange = (page: number) => {
        if (page < 1 || page > totalPages) {
            return;
        }
        setCurrentPage(page);
    };
    // 검색
    const searchFunction = () => {
        setCurrentPage(1);
    };
    return (
        <div className={styles.member}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1>회원 관리</h1>
                    <p>가입된 회원의 권한, 등급 및 상태를 관리할 수 있습니다.</p>
                </div>
            </div>
            {/* Status Filter */}
            <div className={styles.filter}>
                <button
                    className={
                        statusFilter === 'ALL'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter('ALL');
                        setCurrentPage(1);
                    }}
                >전체</button>

                <button
                    className={
                        statusFilter === 'ACTIVE'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter('ACTIVE');
                        setCurrentPage(1);
                    }}
                >정상</button>
                <button
                    className={
                        statusFilter === 'SUSPENDED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => {
                        setStatusFilter('SUSPENDED');
                        setCurrentPage(1);
                    }}
                >정지</button>
                <button
                    className={
                        statusFilter === 'WITHDRAWN'
                            ? styles.activeFilter
                            : ''}
                    onClick={() => {
                        setStatusFilter('WITHDRAWN');
                        setCurrentPage(1);
                    }}
                >탈퇴</button>
            </div>
            {/* Search */}
            <div className={styles.search}>

                <input type="text"
                    placeholder="아이디 / 이름 / 이메일 검색" value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                <button onClick={searchFunction}>
                    검색
                </button>
            </div>
            {/* 회원 수 */}
            <div>
                전체 회원 {totalItems}명
            </div>
            {/* Member Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>아이디</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>권한</th>
                            <th>등급</th>
                            <th>할인</th>
                            <th>상태</th>
                            <th>가입일</th>
                            <th>관리</th>
                        </tr>
                    </thead>

                    <tbody>

                        {currentMembers.length > 0 ? (
                            currentMembers.map(member => (
                                <tr key={member.id}>
                                    <td>{member.id}</td>
                                    <td>{member.loginId}</td>
                                    <td>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>
                                        <select
                                            value={member.role}
                                            onChange={e =>
                                                handleRoleChange(member.id, e.target.value as MemberRole)}
                                            className={styles.select}>
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={member.grade}
                                            onChange={e =>
                                                handleGradeChange(member.id, e.target.value as MemberGrade)}
                                            className={styles.select}>
                                            <option value="BASIC">BASIC</option>
                                            <option value="SILVER">SILVER</option>
                                            <option value="GOLD">GOLD</option>
                                            <option value="VIP">VIP</option>

                                        </select>
                                    </td>
                                    <td>{gradeDiscount[member.grade]}%</td>
                                    <td>

                                        <select value={member.status}
                                            onChange={e =>
                                                handleStatusChange(
                                                    member.id,
                                                    e.target.value as MemberStatus)}
                                            className={styles.select}>
                                            <option value="ACTIVE">정상</option>
                                            <option value="SUSPENDED">정지</option>
                                            <option value="WITHDRAWN">탈퇴</option>
                                        </select>
                                    </td>
                                    <td>{member.joinDate}</td>
                                    <td>
                                        <button
                                            className={styles.applyButton}
                                            onClick={() => handleApply(member)
                                            }>적용</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className={styles.empty}>회원 데이터가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            {totalPages > 0 && (
                <div className={styles.pagination}>

                    {/* 이전 */}
                    {startPage > 1 && (
                        <button
                            className={styles.pageArrow}
                            onClick={() => pageChange(startPage - 1)}
                        >
                            이전
                        </button>
                    )}
                    {/* 페이지 번호 */}
                    {Array.from(
                        { length: endPage - startPage + 1 },
                        (_, i) => i + startPage
                    ).map(page => (
                        <button
                            key={page}
                            className={`${styles.pageButton} ${page === currentPage ? styles.activePage : ''
                                }`} 
                            onClick={() => pageChange(page)}>{page}</button>
                    ))}
                    {/* 다음 */}
                    {endPage < totalPages && (
                        <button className={styles.pageArrow}
                            onClick={() => pageChange(endPage + 1)}
                        >다음</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MemberManagement;