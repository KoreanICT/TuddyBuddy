import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styles from './memberManagement.module.css';
import { useAuth } from '../../../login/hooks/useAuth';
import { useRoleAccess } from '../../../login/hooks/useRoleAccess';
import { MemberRole, ROLE_LABELS, ROLE_ACCESS } from '../../../login/auth/roles';
import ProfileCard from '../../profile/ProfileCard';

type EditableRole = 'MEMBER' | 'SUB_ADMIN';

interface Member {
    member_num: number;
    member_nick: string;
    member_code: string;
    authority: MemberRole;
    regdate: string;
}

interface MemberPage {
    data: Member[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    startPage: number;
    endPage: number;
}

const API_URL = `${(process.env.REACT_APP_BACK_END_URL || 'http://192.168.0.19/back').replace(/\/$/, '')}/api/member`;

const errorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        if (typeof error.response?.data === 'string' && error.response.data.trim()) return error.response.data;
        if (typeof error.response?.data?.message === 'string') return error.response.data.message;
    }
    return fallback;
};

const MemberManagement: React.FC = () => {
    const { token, memberNum } = useAuth();
    const { hasRole } = useRoleAccess();
    const canEdit = hasRole(ROLE_ACCESS.manageMemberRole);
    const canWithdraw = hasRole(ROLE_ACCESS.withdrawMember);
    const [members, setMembers] = useState<Member[]>([]);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0, startPage: 1, endPage: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchType, setSearchType] = useState('4');
    const [searchValue, setSearchValue] = useState('');
    const [query, setQuery] = useState({ searchType: '4', searchValue: '' });
    const [revision, setRevision] = useState(0);
    const [drafts, setDrafts] = useState<Record<number, EditableRole>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const mutationRef = useRef(false);
    const mutating = saving !== null || deleting !== null;
    const isManagedTarget = (member: Member) => Number(member.member_num) !== Number(memberNum)
        && (member.authority === 'MEMBER' || member.authority === 'SUB_ADMIN');

    useEffect(() => {
        let active = true;
        if (!token) {
            setMembers([]);
            setLoading(false);
            setError('로그인이 필요합니다.');
            return;
        }
        const loadMembers = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get<MemberPage>(`${API_URL}/memberList`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { cPage: currentPage, ...query }
                });
                if (!active) return;
                setMembers(response.data.data);
                setPagination({
                    totalItems: response.data.totalItems,
                    totalPages: response.data.totalPages,
                    startPage: response.data.startPage,
                    endPage: response.data.endPage
                });
                setDrafts({});
                if (response.data.currentPage !== currentPage) setCurrentPage(response.data.currentPage);
            } catch (requestError) {
                if (!active) return;
                setMembers([]);
                setError(errorMessage(requestError, '회원 목록을 불러오지 못했습니다.'));
            } finally {
                if (active) setLoading(false);
            }
        };
        loadMembers();
        return () => { active = false; };
    }, [token, currentPage, query, revision]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        if (mutationRef.current) return;
        setCurrentPage(1);
        setQuery({ searchType, searchValue: searchValue.trim() });
    };

    const handleApply = async (member: Member) => {
        const authority = drafts[member.member_num];
        if (!token || !canEdit || loading || mutationRef.current || !isManagedTarget(member)
            || !authority || authority === member.authority) return;
        mutationRef.current = true;
        try {
            setSaving(member.member_num);
            await axios.put(`${API_URL}/admin/authority`, { memberNum: member.member_num, authority }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('회원 권한이 변경되었습니다.');
            setRevision(value => value + 1);
        } catch (requestError) {
            alert(errorMessage(requestError, '회원 권한을 변경하지 못했습니다.'));
        } finally {
            mutationRef.current = false;
            setSaving(null);
        }
    };

    const handleWithdraw = async (member: Member) => {
        if (!token || !canWithdraw || loading || mutationRef.current || !isManagedTarget(member)) return;
        if (!window.confirm(`닉네임: ${member.member_nick}\n회원코드: ${member.member_code}\n\n이 회원을 탈퇴 처리하시겠습니까? 계정은 삭제되며 되돌릴 수 없습니다.`)) return;
        mutationRef.current = true;
        setDeleting(member.member_num);
        try {
            await axios.delete(`${API_URL}/admin/withdraw`, {
                headers: { Authorization: `Bearer ${token}` }, params: { memberNum: member.member_num }
            });
            alert('회원 탈퇴 처리가 완료되었습니다.');
            setRevision(value => value + 1);
        } catch (requestError) {
            alert(errorMessage(requestError, '회원 탈퇴 처리에 실패했습니다.'));
        } finally {
            mutationRef.current = false;
            setDeleting(null);
        }
    };

    const pageChange = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages && !mutationRef.current) setCurrentPage(page);
    };

    return (
        <div className={styles.member}>
            <div className={styles.header}>
                <h1>회원 관리</h1>
                <p>{canEdit ? '회원 정보를 조회하고 권한 변경 및 회원 탈퇴를 처리합니다.' : '회원 정보를 조회합니다. 회원 관리는 최고 관리자만 가능합니다.'}</p>
            </div>
            <form className={styles.search} onSubmit={handleSearch}>
                <select aria-label="회원 검색 기준" className={styles.select} value={searchType}
                    onChange={event => setSearchType(event.target.value)} disabled={mutating}>
                    <option value="4">닉네임</option>
                    <option value="5">회원코드</option>
                    <option value="3">권한</option>
                </select>
                <input aria-label="회원 검색어" placeholder={searchType === '3' ? 'ADMIN / SUB_ADMIN / MEMBER' : '검색어 입력'}
                    value={searchValue} onChange={event => setSearchValue(event.target.value)} disabled={mutating} />
                <button type="submit" disabled={loading || mutating}>검색</button>
            </form>
            {error ? (
                <div role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={() => setRevision(value => value + 1)}>다시 시도</button>
                </div>
            ) : (
                <div>전체 회원 {pagination.totalItems}명</div>
            )}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr><th>번호</th><th>프로필</th><th>닉네임</th><th>회원코드</th><th>권한</th><th>가입일</th><th>관리</th></tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7}>회원 목록을 불러오는 중입니다.</td></tr>
                        ) : error ? (
                            <tr><td colSpan={7}>회원 목록을 확인할 수 없습니다.</td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={7} className={styles.empty}>회원 데이터가 없습니다.</td></tr>
                        ) : members.map(member => {
                            const editable = canEdit && isManagedTarget(member);
                            const withdrawable = canWithdraw && isManagedTarget(member);
                            return (
                                <tr key={member.member_num}>
                                    <td>{member.member_num}</td>
                                    <td>{Number(member.member_num) === Number(memberNum)
                                        ? '본인' : <ProfileCard memberNum={Number(member.member_num)} />}</td>
                                    <td>{member.member_nick}</td>
                                    <td className={styles.memberCode}>{member.member_code}</td>
                                    <td>{!editable ? ROLE_LABELS[member.authority] : (
                                        <div className={styles.authorityActions}>
                                        <select aria-label={`${member.member_nick} 권한`} className={styles.select}
                                            value={drafts[member.member_num] || member.authority}
                                            disabled={!editable || mutating || loading}
                                            onChange={event => {
                                                const authority = event.target.value;
                                                if (authority === 'MEMBER' || authority === 'SUB_ADMIN') {
                                                    setDrafts(previous => ({ ...previous, [member.member_num]: authority }));
                                                }
                                            }}>
                                            <option value="MEMBER">{ROLE_LABELS.MEMBER}</option>
                                            <option value="SUB_ADMIN">{ROLE_LABELS.SUB_ADMIN}</option>
                                        </select>
                                        <button type="button" className={styles.applyButton} onClick={() => handleApply(member)}
                                            disabled={mutating || loading || !drafts[member.member_num] || drafts[member.member_num] === member.authority}>
                                            {saving === member.member_num ? '적용 중...' : '적용'}
                                        </button>
                                        </div>
                                    )}</td>
                                    <td>{member.regdate ? member.regdate.slice(0, 10) : '-'}</td>
                                    <td><div className={styles.managementActions}>{withdrawable && <button type="button" className={styles.withdrawButton}
                                        aria-label={`${member.member_nick} 탈퇴 처리`}
                                        disabled={mutating || loading} onClick={() => handleWithdraw(member)}>
                                        {deleting === member.member_num ? '처리 중...' : '탈퇴 처리'}
                                    </button>}</div></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {!loading && !error && pagination.totalPages > 0 && (
                <div className={styles.pagination}>
                    {pagination.startPage > 1 && <button className={styles.pageArrow} disabled={mutating}
                        onClick={() => pageChange(pagination.startPage - 1)}>이전</button>}
                    {Array.from({ length: Math.max(0, pagination.endPage - pagination.startPage + 1) },
                        (_, index) => pagination.startPage + index).map(page => (
                        <button key={page} aria-current={page === currentPage ? 'page' : undefined}
                            className={`${styles.pageButton} ${page === currentPage ? styles.activePage : ''}`}
                            disabled={mutating} onClick={() => pageChange(page)}>{page}</button>
                    ))}
                    {pagination.endPage < pagination.totalPages && <button className={styles.pageArrow} disabled={mutating}
                        onClick={() => pageChange(pagination.endPage + 1)}>다음</button>}
                </div>
            )}
        </div>
    );
};

export default MemberManagement;
