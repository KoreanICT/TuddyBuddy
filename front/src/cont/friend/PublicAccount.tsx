import React, { useState } from 'react';
import { UserRound, UserPlus, Check } from 'lucide-react';
import styles from './publicAccount.module.css';

interface PublicUser {
    id: number;
    loginId: string;
    name: string;
}

const PublicAccount: React.FC = () => {

    const [accounts] = useState<PublicUser[]>([
        {
            id: 1,
            loginId: 'study01',
            name: '김민수'
        },
        {
            id: 2,
            loginId: 'coding02',
            name: '이서연'
        },
        {
            id: 3,
            loginId: 'math03',
            name: '박지훈'
        },
        {
            id: 4,
            loginId: 'spring04',
            name: '최유진'
        },
        {
            id: 5,
            loginId: 'react05',
            name: '정현우'
        },
        {
            id: 6,
            loginId: 'java06',
            name: '한지민'
        }
    ]);

    const [addedFriends, setAddedFriends] = useState<number[]>([]);

    const handleAddFriend = (userId: number) => {

        // TODO: 친구 추가 API 연결

        setAddedFriends(prev => [
            ...prev,
            userId
        ]);
    };

    return (
        <section className={styles.publicAccount}>

            <div className={styles.header}>
                <h2>새로운 친구를 만나보세요</h2>

                <p>
                    프로필을 공개한 사용자와 친구가 되어보세요.
                </p>
            </div>


            <div className={styles.cardList}>

                {accounts.map(account => {

                    const added =
                        addedFriends.includes(account.id);

                    return (
                        <div
                            key={account.id}
                            className={styles.userCard}
                        >

                            {/* 프로필 */}
                            <div className={styles.avatar}>
                                <UserRound size={30} />
                            </div>


                            {/* 사용자 정보 */}
                            <div className={styles.userText}>

                                <strong>
                                    {account.loginId}
                                </strong>

                                <span>
                                    {account.name}
                                </span>

                            </div>


                            {/* 친구 추가 */}
                            <button
                                type="button"
                                className={
                                    added
                                        ? styles.addedButton
                                        : styles.addButton
                                }
                                disabled={added}
                                onClick={() =>
                                    handleAddFriend(account.id)
                                }
                            >

                                {added ? (
                                    <>
                                        <Check size={15} />
                                        추가됨
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={15} />
                                        친구 추가
                                    </>
                                )}

                            </button>

                        </div>
                    );
                })}

            </div>

        </section>
    );
};

export default PublicAccount;