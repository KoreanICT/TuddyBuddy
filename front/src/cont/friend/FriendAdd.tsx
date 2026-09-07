import React, { useState } from 'react';
import styles from './friendAdd.module.css';

const FriendAdd: React.FC = () => {

    const [studentCode, setStudentCode] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = () => {

        if (!studentCode.trim()) {
            alert('스터던트 코드를 입력해주세요.');
            return;
        }

        // TODO: 백엔드 API 연결
        setSearched(true);
    };

    const handleAddFriend = () => {
        // TODO: 친구 추가 API 연결
        alert('친구 추가 기능은 준비 중입니다.');
    };

    return (
        <div className={styles.friendAdd}>

            {/* =========================
                Header
            ========================= */}

            <div className={styles.header}>
                <h1>친구 추가</h1>
                <p>
                    친구의 스터던트 코드를 입력하여 친구를 찾아보세요.
                </p>
            </div>


            {/* =========================
                Search
            ========================= */}

            <div className={styles.searchBox}>

                <input
                    type="text"
                    value={studentCode}
                    onChange={e =>
                        setStudentCode(e.target.value)
                    }
                    placeholder="스터던트 코드 입력"
                />

                <button
                    onClick={handleSearch}
                >
                    검색
                </button>

            </div>


            {/* =========================
                Search Result
            ========================= */}

            {searched && (

                <div className={styles.result}>

                    <div className={styles.profile}>

                        <div className={styles.profileImage}>
                            👤
                        </div>

                        <div className={styles.profileInfo}>
                            <h2>홍길동</h2>
                            <p>test01</p>
                        </div>

                    </div>

                    <button
                        className={styles.addButton}
                        onClick={handleAddFriend}
                    >
                        친구 추가
                    </button>

                </div>

            )}

        </div>
    );
};

export default FriendAdd;