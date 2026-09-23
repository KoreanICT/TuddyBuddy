import React, { useState } from 'react';
import {
    Search,
    UserRound,
    UserPlus,
    IdCard
} from 'lucide-react';

import styles from './friendAdd.module.css';
import StudentCodeModal from './StudentCodeModal';
import PublicAccount from './PublicAccount';

const FriendAdd: React.FC = () => {

    const [studentCode, setStudentCode] = useState('');
    const [searched, setSearched] = useState(false);

    const [isCodeOpen, setIsCodeOpen] = useState(false);

    // TODO: 로그인한 회원의 실제 Student Code
    const myStudentCode =
        '8f3a2b7c-91d4-4e6a-b528-73c9d1f04a82';


    const handleSearch = () => {

        if (!studentCode.trim()) {
            alert('스터던트 코드를 입력해주세요.');
            return;
        }

        // TODO: 백엔드 API 연결
        setSearched(true);
    };


    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {

        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    const handleAddFriend = () => {

        // TODO: 친구 추가 API 연결
        alert('친구 추가 기능은 준비 중입니다.');
    };


    return (
        <div className={styles.page}>

            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>

                    <div>
                        <h1>친구 추가</h1>

                        <p>
                            스터던트 코드로 친구를 찾아보세요.
                        </p>
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
                            value={studentCode}
                            onChange={(e) =>
                                setStudentCode(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="스터던트 코드 검색"
                        />

                        {studentCode && (
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={() => {
                                    setStudentCode('');
                                    setSearched(false);
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
                {searched && (

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
                                    <strong>test01</strong>
                                    <span>홍길동</span>
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

            </div>
            <PublicAccount />


            <StudentCodeModal
                isOpen={isCodeOpen}
                onClose={() => setIsCodeOpen(false)}
                studentCode={myStudentCode}
            />

        </div>
    );
};

export default FriendAdd;