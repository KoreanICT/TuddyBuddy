import React, { useState } from 'react';
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
    // 회원 데이터

    const [members, setMembers] = useState<Member[]>([
        {
            id: 1,
            loginId: 'test01',
            name: '홍길동',
            email: 'test@test.com',
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
    ]);
    // 필터 / 검색 상태

    const [statusFilter, setStatusFilter] =
        useState<MemberStatus | 'ALL'>('ALL');

    const [search, setSearch] = useState('');

    // 회원 권한 수정

    const handleRoleChange = (
        id: number,
        role: MemberRole
    ) => {
        setMembers(prev =>
            prev.map(member =>
                member.id === id
                    ? { ...member, role }
                    : member
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
                member.id === id
                    ? { ...member, grade }
                    : member
            )
        );
    };

    // 회원 상태 수정

    const handleStatusChange = (
        id: number,
        status: MemberStatus
    ) => {
        setMembers(prev =>
            prev.map(member =>
                member.id === id
                    ? { ...member, status }
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
                    onClick={() => setStatusFilter('ALL')}
                >전체</button>

                <button
                    className={
                        statusFilter === 'ACTIVE'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => setStatusFilter('ACTIVE')}
                >정상</button>

                <button
                    className={
                        statusFilter === 'SUSPENDED'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => setStatusFilter('SUSPENDED')}
                >정지</button>
                <button
                    className={
                        statusFilter === 'WITHDRAWN'
                            ? styles.activeFilter
                            : ''
                    }
                    onClick={() => setStatusFilter('WITHDRAWN')}
                >탈퇴</button>
            </div>


            {/* Search */}

            <div className={styles.search}>
                <input type="text" placeholder="아이디 / 이름 / 이메일 검색" value={search} onChange={e => setSearch(e.target.value)}/>

                <button>검색</button>

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

                        {filteredMembers.length > 0 ? (

                            filteredMembers.map(member => (

                                <tr key={member.id}>
                                    <td>{member.id}</td>
                                    <td>{member.loginId}</td>
                                    <td>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>
                                        <select
                                            value={member.role}
                                            onChange={e =>
                                                handleRoleChange(
                                                    member.id,
                                                    e.target.value as MemberRole
                                                )
                                            }
                                            className={styles.select}>
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={member.grade}
                                            onChange={e =>
                                                handleGradeChange(
                                                    member.id,
                                                    e.target.value as MemberGrade
                                                )
                                            }
                                            className={styles.select}>
                                            <option value="BASIC">BASIC</option>
                                            <option value="SILVER">SILVER</option>
                                            <option value="GOLD">GOLD</option>
                                            <option value="VIP">VIP</option>
                                        </select>
                                    </td>
                                    <td>
                                        {gradeDiscount[member.grade]}%
                                    </td>
                                    <td>
                                        <select
                                            value={member.status}
                                            onChange={e =>
                                                handleStatusChange(
                                                    member.id,
                                                    e.target.value as MemberStatus
                                                )}
                                            className={styles.select}>
                                            <option value="ACTIVE">정상</option>
                                            <option value="SUSPENDED">정지</option>
                                            <option value="WITHDRAWN">탈퇴</option>
                                        </select>
                                    </td>
                                    {/* 가입일 */}
                                    <td>
                                        {member.joinDate}
                                    </td>
                                    {/* 적용 */}
                                    <td>
                                        <button
                                            className={styles.applyButton}
                                            onClick={() =>handleApply(member)}>적용
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className={styles.empty}>
                                    회원 데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberManagement;