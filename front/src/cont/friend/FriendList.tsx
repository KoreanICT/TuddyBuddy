
// 주용현

import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { UserRound, Trash2, Users } from 'lucide-react';

import styles from './friendList.module.css';
import { useAuth } from '../../login/hooks/useAuth';
import FriendMenu from './FriendMenu';
import ReportButton from '../report/ReportButton';

interface FriendVO {
    num: number;
    status: string;
    requested_date: string;
    responsed_date: string;
    request_num: number;
    response_num: number;
    member_nick?: string;
}

interface MemberProfile {
    MEMBER_NICK: string;
    MEMBER_CODE: string;
}

const FriendList: React.FC = () => {
    const [friends, setFriends] = useState<FriendVO[]>([]);

    // 커스텀 훅에서 member_num 가져오기
    const { memberNum, token } = useAuth();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);


    
    // 상대방 회원 번호
    const getFriendMemberNum = useCallback((friend: FriendVO) => {
        const loginNum = Number(memberNum);
        const requestNum = Number(friend.request_num);
        const responseNum = Number(friend.response_num);

        const friendNum = requestNum === loginNum ? responseNum : requestNum;

        return friendNum;
    }, [memberNum]);

    // 친구 목록 조회
    const fetchFriendList = useCallback(async () => {
        if (!token || memberNum == null) return;

        try {
            const urls = "http://localhost:80/back/api/friend/friendList";
            const response = await axios.get<FriendVO[]>(urls, {
                headers: getAuthHeaders(),
                params: { member_num: memberNum }
            });

            // 친구 회원 번호로 닉네임 조회
            const friendProfiles = await Promise.all(response.data.map(async friend => {
                try {
                    const profileUrl = "http://localhost:80/back/api/member/memberProfile";
                    const profile = await axios.get<MemberProfile>(profileUrl, {
                        headers: getAuthHeaders(),
                        params: { member_num: getFriendMemberNum(friend) }
                    });

                    return { ...friend, member_nick: profile.data.MEMBER_NICK };
                } catch (error) {
                    console.error('친구 닉네임 조회 실패:', error);
                    return { ...friend, member_nick: '알 수 없는 회원' };
                }
            }));

            setFriends(friendProfiles);
        } catch (error) {
            console.error('친구 목록 조회 실패:', error);
            setFriends([]);
        }
    }, [memberNum, token, getAuthHeaders, getFriendMemberNum]);

    useEffect(() => {
        if (!token || memberNum == null) {
            setFriends([]);
            return;
        }
        fetchFriendList();
    }, [memberNum, token, fetchFriendList]);

    // 친구 삭제
    const handleDeleteFriend = async (friendNum: number) => {
        if (!token || memberNum == null) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const confirmed = window.confirm('친구를 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            const urls = "http://localhost:80/back/api/friend/friendDelete";

            await axios.delete(urls, {
                headers: getAuthHeaders(),
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

                {/* 친구 관리 메뉴 */}
                <FriendMenu />

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
                                        {/* 친구 닉네임 출력 */}
                                        <strong>{friend.member_nick || '알 수 없는 회원'}</strong>
                                        <span>친구</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <ReportButton type="user" targetNum={getFriendMemberNum(friend)}
                                        aria-label={`${friend.member_nick || '친구'} 회원 신고`}>신고</ReportButton>
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
