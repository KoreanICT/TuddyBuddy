import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './memberManagement.module.css';
import { useAuth } from '../../../login/hooks/useAuth';
import { parseJwt } from '../../../login/comp/jwtUtils';
import { MemberRole, ROLE_LABELS } from '../../../login/auth/roles';

type EditableRole = 'MEMBER' | 'SUB_ADMIN';

interface Member {
    member_num: number;
    member_email: string;
    member_name: string;
    member_nick: string;
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
    const decoded = token ? parseJwt(token) : null;
    const canEdit = decoded?.role === 'ADMIN' && decoded.exp > Date.now() / 1000;
    const [members, setMembers] = useState<Member[]>([]);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0, startPage: 1, endPage: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchType, setSearchType] = useState('1');
    const [searchValue, setSearchValue] = useState('');
    const [query, setQuery] = useState({ searchType: '1', searchValue: '' });
    const [revision, setRevision] = useState(0);
    const [drafts, setDrafts] = useState<Record<number, EditableRole>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState<number | null>(null);

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
        setCurrentPage(1);
        setQuery({ searchType, searchValue: searchValue.trim() });
    };

    const handleApply = async (member: Member) => {
        const authority = drafts[member.member_num];
        if (!token || !canEdit || saving !== null || member.authority === 'ADMIN'
            || member.member_num === memberNum || !authority || authority === member.authority) return;
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
            setSaving(null);
        }
    };

    const pageChange = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages && saving === null) setCurrentPage(page);
    };

    return (
        <div className={styles.member}>
            <div className={styles.header}>
                <h1>회원 관리</h1>
                <p>{canEdit ? '회원 정보를 조회하고 일반 회원과 부관리자의 권한을 변경합니다.' : '회원 정보를 조회합니다. 권한 변경은 최고 관리자만 가능합니다.'}</p>
            </div>
            <form className={styles.search} onSubmit={handleSearch}>
                <select aria-label="회원 검색 기준" className={styles.select} value={searchType}
                    onChange={event => setSearchType(event.target.value)} disabled={saving !== null}>
                    <option value="1">이름</option>
                    <option value="2">이메일</option>
                    <option value="3">권한</option>
                </select>
                <input aria-label="회원 검색어" placeholder={searchType === '3' ? 'ADMIN / SUB_ADMIN / MEMBER' : '검색어 입력'}
                    value={searchValue} onChange={event => setSearchValue(event.target.value)} disabled={saving !== null} />
                <button type="submit" disabled={loading || saving !== null}>검색</button>
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
                        <tr><th>번호</th><th>이름</th><th>닉네임</th><th>이메일</th><th>권한</th><th>가입일</th><th>관리</th></tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7}>회원 목록을 불러오는 중입니다.</td></tr>
                        ) : error ? (
                            <tr><td colSpan={7}>회원 목록을 확인할 수 없습니다.</td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={7} className={styles.empty}>회원 데이터가 없습니다.</td></tr>
                        ) : members.map(member => {
                            const editable = canEdit && member.authority !== 'ADMIN' && member.member_num !== memberNum;
                            return (
                                <tr key={member.member_num}>
                                    <td>{member.member_num}</td>
                                    <td>{member.member_name}</td>
                                    <td>{member.member_nick}</td>
                                    <td>{member.member_email}</td>
                                    <td>{member.authority === 'ADMIN' ? ROLE_LABELS.ADMIN : (
                                        <select aria-label={`${member.member_nick} 권한`} className={styles.select}
                                            value={drafts[member.member_num] || member.authority}
                                            disabled={!editable || saving !== null}
                                            onChange={event => {
                                                const authority = event.target.value;
                                                if (authority === 'MEMBER' || authority === 'SUB_ADMIN') {
                                                    setDrafts(previous => ({ ...previous, [member.member_num]: authority }));
                                                }
                                            }}>
                                            <option value="MEMBER">{ROLE_LABELS.MEMBER}</option>
                                            <option value="SUB_ADMIN">{ROLE_LABELS.SUB_ADMIN}</option>
                                        </select>
                                    )}</td>
                                    <td>{member.regdate ? member.regdate.slice(0, 10) : '-'}</td>
                                    <td>{editable ? (
                                        <button className={styles.applyButton} onClick={() => handleApply(member)}
                                            disabled={saving !== null || !drafts[member.member_num] || drafts[member.member_num] === member.authority}>
                                            {saving === member.member_num ? '적용 중...' : '적용'}
                                        </button>
                                    ) : '조회 전용'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {!loading && !error && pagination.totalPages > 0 && (
                <div className={styles.pagination}>
                    {pagination.startPage > 1 && <button className={styles.pageArrow} disabled={saving !== null}
                        onClick={() => pageChange(pagination.startPage - 1)}>이전</button>}
                    {Array.from({ length: Math.max(0, pagination.endPage - pagination.startPage + 1) },
                        (_, index) => pagination.startPage + index).map(page => (
                        <button key={page} aria-current={page === currentPage ? 'page' : undefined}
                            className={`${styles.pageButton} ${page === currentPage ? styles.activePage : ''}`}
                            disabled={saving !== null} onClick={() => pageChange(page)}>{page}</button>
                    ))}
                    {pagination.endPage < pagination.totalPages && <button className={styles.pageArrow} disabled={saving !== null}
                        onClick={() => pageChange(pagination.endPage + 1)}>다음</button>}
                </div>
            )}
        </div>
    );
};

export default MemberManagement;
