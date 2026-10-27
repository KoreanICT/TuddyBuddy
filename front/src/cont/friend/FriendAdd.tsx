import { BACKEND_URL } from '../../login/authHttp';

 // 주용현

import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Search, UserRound, UserPlus, IdCard } from 'lucide-react';

import styles from './friendAdd.module.css';
import StudentCodeModal from './StudentCodeModal';
import { useAuth } from '../../login/hooks/useAuth';
import { useMyProfileInfo } from '../../login/hooks/useMyProfileInfo';

interface MemberVO {
    member_num: number;
    member_name: string;
    member_nick: string;
    member_code: string;
}

const FriendAdd: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
    const [memberCode, setMemberCode] = useState('');
    const [searched, setSearched] = useState(false);
    const [searchedMember, setSearchedMember] = useState<MemberVO | null>(null);
    const [isCodeOpen, setIsCodeOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [adding, setAdding] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const { memberNum, token } = useAuth();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);
    const { profile, loading } = useMyProfileInfo();
    const myMemberCode = profile?.member_code ?? '';
    const myMemberNick = profile?.member_nick ?? '';

    // 회원 코드 검색
    const handleSearch = async () => {
        const code = memberCode.trim();

        if (!code) {
            alert('스터던트 코드를 입력해주세요.');
            return;
        }

        if (searching) return;

        setSearching(true);
        setSearched(false);
        setSearchedMember(null);
        setRequestSent(false);

        try {
            const urls = `${BACKEND_URL}/api/member/memberCodeSearch`;
            const response = await axios.get<MemberVO | null>(urls, {
                headers: getAuthHeaders(),
                params: { member_code: code }
            });

            setSearchedMember(response.data || null);
            setSearched(true);
        } catch (error) {
            console.error('회원 검색 실패:', error);

            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setSearchedMember(null);
                setSearched(true);
            } else {
                alert('회원 검색 중 오류가 발생했습니다. 회원 검색 API를 확인해주세요.');
            }
        } finally {
            setSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    // 친구 요청
    const handleAddFriend = async () => {
        if (!searchedMember || adding || requestSent) return;

        if (!token || memberNum == null) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        if (searchedMember.member_num === memberNum) {
            alert('자기 자신에게는 친구 요청을 보낼 수 없습니다.');
            return;
        }

        setAdding(true);

        try {
            const urls = `${BACKEND_URL}/api/friend/friendAdd`;
            const formData = new FormData();

            formData.append('request_num', String(memberNum));
            formData.append('response_num', String(searchedMember.member_num));

            await axios.post(urls, formData, { headers: getAuthHeaders() });

            setRequestSent(true);
            alert('친구 요청을 보냈습니다.');
        } catch (error) {
            console.error('친구 요청 실패:', error);

            if (axios.isAxiosError(error)) {
                const message = typeof error.response?.data === 'string'
                    ? error.response.data
                    : '친구 요청에 실패했습니다.';

                if (error.response?.status === 409) {
                    setRequestSent(true);
                }

                alert(message);
            } else {
                alert('친구 요청에 실패했습니다.');
            }
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className={`${styles.page} ${embedded ? styles.embeddedPage : ''}`}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>친구 추가</h1>
                        <p>스터던트 코드로 친구를 찾아보세요.</p>
                    </div>

                    {/* 내 회원 코드 */}
                    <button
                        type="button"
                        className={styles.codeButton}
                        onClick={() => setIsCodeOpen(true)}
                        disabled={loading || !myMemberCode}
                    >
                        <IdCard size={17} />
                        {loading ? '조회 중...' : '내 코드'}
                    </button>
                </div>

                {/* Search */}
                <div className={styles.searchArea}>
                    <div className={styles.searchInput}>
                        <Search size={19} className={styles.searchIcon} />

                        <input
                            type="text"
                            value={memberCode}
                            onChange={(e) => {
                                setMemberCode(e.target.value);
                                setSearched(false);
                                setSearchedMember(null);
                                setRequestSent(false);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="스터던트 코드 검색"
                        />

                        {memberCode && (
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={() => {
                                    setMemberCode('');
                                    setSearched(false);
                                    setSearchedMember(null);
                                    setRequestSent(false);
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <button type="button" className={styles.searchButton} onClick={handleSearch} disabled={searching}>
                        {searching ? '검색 중...' : '검색'}
                    </button>
                </div>

                {/* 검색 전 */}
                {!searched && (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            <UserRound size={30} />
                        </div>
                        <h2>친구 찾기</h2>
                        <p>친구에게 받은 스터던트 코드를 입력해 검색해보세요.</p>
                    </div>
                )}

                {/* 검색 결과 */}
                {searched && searchedMember && (
                    <div className={styles.resultSection}>
                        <div className={styles.sectionTitle}>검색 결과</div>

                        <div className={styles.userItem}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatar}>
                                    <UserRound size={25} />
                                </div>

                                <div className={styles.userText}>
                                    <strong>{searchedMember.member_nick}</strong>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={styles.addButton}
                                onClick={handleAddFriend}
                                disabled={adding || requestSent || searchedMember.member_num === memberNum}
                            >
                                <UserPlus size={16} />
                                {requestSent ? '요청 완료' : adding ? '요청 중...' : '친구 추가'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 검색 결과 없음 */}
                {searched && !searchedMember && (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            <UserRound size={30} />
                        </div>
                        <h2>검색 결과가 없습니다.</h2>
                        <p>스터던트 코드를 다시 확인해주세요.</p>
                    </div>
                )}
            </div>

            <StudentCodeModal
                isOpen={isCodeOpen}
                onClose={() => setIsCodeOpen(false)}
                memberCode={myMemberCode}
            />
        </div>
    );
};

export default FriendAdd;
