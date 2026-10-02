import axios from 'axios';
import React, { useState } from 'react';
import { Search, UserRound, UserPlus, IdCard } from 'lucide-react';

import styles from './friendAdd.module.css';
import StudentCodeModal from './StudentCodeModal';
import PublicAccount from './PublicAccount';

interface MemberVO {
    member_num: number;
    member_name: string;
    member_nick: string;
    member_code: string;
}

const FriendAdd: React.FC = () => {

    const [memberCode, setMemberCode] = useState('');
    const [searched, setSearched] = useState(false);
    const [searchedMember, setSearchedMember] = useState<MemberVO | null>(null);
    const [isCodeOpen, setIsCodeOpen] = useState(false);
    const dummyMembers: MemberVO[] = [
        {
            member_num: 1,
            member_name: '홍길동',
            member_nick: 'test01',
            member_code: 'STUDENT-001'
        },
        {
            member_num: 2,
            member_name: '김철수',
            member_nick: 'test02',
            member_code: 'STUDENT-002'
        },
        {
            member_num: 3,
            member_name: '이영희',
            member_nick: 'test03',
            member_code: 'STUDENT-003'
        },
        {
            member_num: 4,
            member_name: '박민수',
            member_nick: 'study04',
            member_code: 'STUDENT-004'
        },
        {
            member_num: 5,
            member_name: '최유진',
            member_nick: 'coding05',
            member_code: 'STUDENT-005'
        }
    ];

    // TODO: 로그인 연결 후 실제 회원의 Student Code 사용
    const myMemberCode = '8f3a2b7c-91d4-4e6a-b528-73c9d1f04a82';

    // Student Code 회원 검색
    const handleSearch = async () => {
        if (!memberCode.trim()) {
            alert('스터던트 코드를 입력해주세요.');
            return;
        }

        /*
        TODO: Student Code 회원 검색 API 구현 후 연결

        try {
            const urls = "http://localhost:80/back/api/member/studentCodeSearch";

            const response = await axios.get(urls, {
                params: {
                    studentCode: studentCode
                }
            });

            setSearchedMember(response.data);
            setSearched(true);

        } catch (error) {
            console.error('회원 검색 실패:', error);
            setSearchedMember(null);
            setSearched(true);
        }
        */

        // TODO: 회원 검색 API 연결 후 삭제
        // TODO: member_code 검색 API 연결 후 삭제
        const member = dummyMembers.find(
            member => member.member_code === memberCode.trim()
        );
        setSearchedMember(member || null);
        setSearched(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 친구 요청
    const handleAddFriend = async () => {
        if (!searchedMember) {
            return;
        }

        try {
            const urls = "http://localhost:80/back/api/friend/friendAdd";

            const formData = new FormData();

            // TODO: 로그인 연결 후 실제 로그인 회원 번호 사용
            formData.append('request_num', '1');
            formData.append('response_num', String(searchedMember.member_num));

            await axios.post(urls, formData);

            alert('친구 요청을 보냈습니다.');

        } catch (error) {
            console.error('친구 요청 실패:', error);
            alert('친구 요청에 실패했습니다.');
        }
    };

    return (
        <div className={styles.page}>

            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>

                    <div>
                        <h1>친구 추가</h1>
                        <p>스터던트 코드로 친구를 찾아보세요.</p>
                    </div>

                    <button
                        type="button"
                        className={styles.codeButton}
                        onClick={() => setIsCodeOpen(true)}
                    >
                        <IdCard size={17} />
                        내 코드
                    </button>

                </div>

                {/* Search */}
                <div className={styles.searchArea}>

                    <div className={styles.searchInput}>

                        <Search
                            size={19}
                            className={styles.searchIcon}
                        />

                        <input
                            type="text"
                            value={memberCode}
                            onChange={(e) => setMemberCode(e.target.value)}
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
                                }}
                            >
                                ×
                            </button>
                        )}

                    </div>

                    <button
                        type="button"
                        className={styles.searchButton}
                        onClick={handleSearch}
                    >
                        검색
                    </button>

                </div>

                {/* 검색 전 */}
                {!searched && (
                    <div className={styles.empty}>

                        <div className={styles.emptyIcon}>
                            <UserRound size={30} />
                        </div>

                        <h2>친구 찾기</h2>

                        <p>
                            친구에게 받은 스터던트 코드를
                            입력해 검색해보세요.
                        </p>

                    </div>
                )}

                {/* 검색 결과 */}
                {searched && searchedMember && (
                    <div className={styles.resultSection}>

                        <div className={styles.sectionTitle}>
                            검색 결과
                        </div>

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
                            >
                                <UserPlus size={16} />
                                친구 추가
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

            <PublicAccount />

            <StudentCodeModal
                isOpen={isCodeOpen}
                onClose={() => setIsCodeOpen(false)}
                memberCode={myMemberCode}
            />

        </div>
    );
};

export default FriendAdd;