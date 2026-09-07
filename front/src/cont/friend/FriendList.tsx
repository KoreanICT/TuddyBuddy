import React from 'react';
import styles from './friendList.module.css';

interface Friend {
    id: number;
    name: string;
    loginId: string;
    status: 'ONLINE' | 'OFFLINE';
}

const FriendList: React.FC = () => {

    const friends: Friend[] = [
        {
            id: 1,
            name: '홍길동',
            loginId: 'test01',
            status: 'ONLINE',
        },
        {
            id: 2,
            name: '김철수',
            loginId: 'test02',
            status: 'OFFLINE',
        },
        {
            id: 3,
            name: '이영희',
            loginId: 'test03',
            status: 'ONLINE',
        },
    ];

    return (
        <div className={styles.friendList}>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1>내 친구</h1>
                    <p>
                        등록된 친구를 확인할 수 있습니다.
                    </p>
                </div>

                <span className={styles.count}>
                    {friends.length}명
                </span>
            </div>


            {/* Friend List */}
            <div className={styles.list}>

                {friends.length > 0 ? (

                    friends.map(friend => (

                        <div
                            key={friend.id}
                            className={styles.friend}
                        >

                            {/* Profile */}
                            <div className={styles.profile}>

                                <div className={styles.profileImage}>
                                    👤
                                </div>

                                <div className={styles.info}>
                                    <h2>{friend.name}</h2>
                                    <p>{friend.loginId}</p>
                                </div>

                            </div>


                            {/* Status */}
                            <div className={styles.right}>

                                <span
                                    className={`${styles.status} ${
                                        friend.status === 'ONLINE'
                                            ? styles.online
                                            : styles.offline
                                    }`}
                                >
                                    {friend.status === 'ONLINE'
                                        ? '온라인'
                                        : '오프라인'}
                                </span>

                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    onClick={() =>
                                        console.log(
                                            '친구 삭제:',
                                            friend
                                        )
                                    }
                                >
                                    삭제
                                </button>

                            </div>

                        </div>

                    ))

                ) : (

                    <div className={styles.empty}>
                        <p>등록된 친구가 없습니다.</p>
                    </div>

                )}

            </div>

        </div>
    );
};

export default FriendList;