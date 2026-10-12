
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { UserRound, Trash2, Users } from 'lucide-react';

import styles from './friendList.module.css';

interface FriendVO {
    num: number;
    status: string;
    requested_date: string;
    responsed_date: string;
    request_num: number;
    response_num: number;
}

const FriendList: React.FC = () => {
    const [friends, setFriends] = useState<FriendVO[]>([]);

    // TODO: 로그인 연결 후 실제 로그인 회원 번호 사용
    const memberNum = 1;

    // 친구 목록 조회
    const fetchFriendList = async () => {
        try {
            const urls = "http://localhost:80/back/api/friend/friendList";
            const response = await axios.get(urls, {
                params: { member_num: memberNum }
            });

            setFriends(response.data);
        } catch (error) {
            console.error('친구 목록 조회 실패:', error);
            setFriends([]);
        }
    };

    useEffect(() => {
        fetchFriendList();
    }, []);

    // 상대방 회원 번호
    const getFriendMemberNum = (friend: FriendVO) => {
        return friend.request_num === memberNum ? friend.response_num : friend.request_num;
    };

    // 친구 삭제
    const handleDeleteFriend = async (friendNum: number) => {
        const confirmed = window.confirm('친구를 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            const urls = "http://localhost:80/back/api/friend/friendDelete";

            await axios.delete(urls, {
                params: {
                    num: friendNum,
                    member_num: memberNum
                }
            });

            setFriends(prev => prev.filter(friend => friend.num !== friendNum));
            alert('친구가 삭제되었습니다.');
        } catch (error) {
            console.error('친구 삭제 실패:', error);
            alert('친구 삭제에 실패했습니다.');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>내 친구</h1>
                        <p>등록된 친구를 확인하고 관리할 수 있습니다.</p>
                    </div>
                </div>

                {/* Summary */}
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <Users size={17} />
                        <span>친구</span>
                        <strong>{friends.length}</strong>
                    </div>
                </div>

                {/* List Header */}
                <div className={styles.listHeader}>
                    <span>친구 {friends.length}명</span>
                </div>

                {/* Friend List */}
                <div className={styles.list}>
                    {friends.length > 0 ? (
                        friends.map(friend => (
                            <div key={friend.num} className={styles.friend}>
                                <div className={styles.profile}>
                                    <div className={styles.profileImage}>
                                        <UserRound size={25} />
                                    </div>

                                    <div className={styles.info}>
                                        {/* TODO: 회원 정보 API 연결 후 loginId 출력 */}
                                        <strong>회원 #{getFriendMemberNum(friend)}</strong>

                                        {/* TODO: 회원 정보 API 연결 후 name 출력 */}
                                        <span>친구</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteFriend(friend.num)}
                                    aria-label="친구 삭제"
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
                            <h2>등록된 친구가 없습니다.</h2>
                            <p>친구 추가에서 새로운 친구를 찾아보세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendList;
