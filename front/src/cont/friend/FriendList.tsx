import React, { useState } from 'react';
import {
    UserRound,
    Trash2,
    Users
} from 'lucide-react';

import styles from './friendList.module.css';


interface Friend {
    id: number;
    name: string;
    loginId: string;
}


const FriendList: React.FC = () => {

    const [friends, setFriends] = useState<Friend[]>([
        {
            id: 1,
            name: '홍길동',
            loginId: 'test01',
        },
        {
            id: 2,
            name: '김철수',
            loginId: 'test02',
        },
        {
            id: 3,
            name: '이영희',
            loginId: 'test03',
        },
        {
            id: 4,
            name: '박민수',
            loginId: 'study04',
        },
        {
            id: 5,
            name: '최유진',
            loginId: 'coding05',
        },
    ]);


    const handleDeleteFriend = (friendId: number) => {

        const confirmed = window.confirm(
            '친구를 삭제하시겠습니까?'
        );

        if (!confirmed) {
            return;
        }

        // TODO: 친구 삭제 API 연결

        setFriends(prev =>
            prev.filter(friend =>
                friend.id !== friendId
            )
        );
    };


    return (
        <div className={styles.page}>

            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>

                    <div>
                        <h1>내 친구</h1>

                        <p>
                            등록된 친구를 확인하고 관리할 수 있습니다.
                        </p>
                    </div>

                </div>


                {/* Summary */}
                <div className={styles.summary}>

                    <div className={styles.summaryItem}>
                        <Users size={17} />

                        <span>친구</span>

                        <strong>
                            {friends.length}
                        </strong>
                    </div>

                </div>


                {/* List Header */}
                <div className={styles.listHeader}>
                    <span>
                        친구 {friends.length}명
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

                                <div className={styles.profile}>

                                    <div className={styles.profileImage}>
                                        <UserRound size={25} />
                                    </div>


                                    <div className={styles.info}>

                                        <strong>
                                            {friend.loginId}
                                        </strong>

                                        <span>
                                            {friend.name}
                                        </span>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    onClick={() =>
                                        handleDeleteFriend(friend.id)
                                    }
                                    aria-label={`${friend.name} 친구 삭제`}
                                    title="친구 삭제"
                                >
                                    <Trash2 size={17} />
                                </button>

                            </div>

                        ))

                    ) : (

                        <div className={styles.empty}>

                            <div className={styles.emptyIcon}>
                                <Users size={30} />
                            </div>

                            <h2>
                                등록된 친구가 없습니다.
                            </h2>

                            <p>
                                친구 추가에서 새로운 친구를 찾아보세요.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default FriendList;