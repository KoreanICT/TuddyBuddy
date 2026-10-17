import { BACKEND_URL } from '../../login/authHttp';

// 주용현

import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserRound, UserPlus, Inbox, Send } from 'lucide-react';

import { useAuth } from '../../login/hooks/useAuth';
import styles from './myFriend.module.css';

interface FriendVO {
    num: number;
    request_num: number;
    response_num: number;
    status: string;
    member_nick?: string;
}

interface MemberProfile {
    MEMBER_NICK?: string;
    member_nick?: string;
}

const API_URL = `${BACKEND_URL}/api`;

const MyFriend: React.FC = () => {
    const [friends, setFriends] = useState<FriendVO[]>([]);
    const [loading, setLoading] = useState(true);
    const { memberNum, token } = useAuth();
    const navigate = useNavigate();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    // 내 친구 목록 조회
    useEffect(() => {
        if (!token || memberNum == null) {
            setFriends([]);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const fetchFriends = async () => {
            setLoading(true);

            try {
                const urls = `${API_URL}/friend/friendList`;
                const response = await axios.get<FriendVO[]>(urls, {
                    headers: getAuthHeaders(),
                    params: { member_num: memberNum }
                });

                const friendProfiles = await Promise.all(response.data.map(async friend => {
                    const friendNum = Number(friend.request_num) === Number(memberNum)
                        ? friend.response_num : friend.request_num;

                    try {
                        const profileUrl = `${API_URL}/member/memberProfile`;
                        const profile = await axios.get<MemberProfile>(profileUrl, {
                            headers: getAuthHeaders(),
                            params: { member_num: friendNum }
                        });

                        return {
                            ...friend,
                            member_nick: profile.data.MEMBER_NICK ?? profile.data.member_nick ?? '알 수 없는 회원'
                        };
                    } catch (error) {
                        console.error('친구 닉네임 조회 실패:');
                        return { ...friend, member_nick: '알 수 없는 회원' };
                    }
                }));

                if (!cancelled) setFriends(friendProfiles);
            } catch (error) {
                console.error('내 친구 목록 조회 실패:');
                if (!cancelled) setFriends([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchFriends();

        return () => { cancelled = true; };
    }, [memberNum, token, getAuthHeaders]);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2>내 친구</h2>
                    <p>등록된 친구를 확인하고 관리할 수 있습니다.</p>
                </div>
            </div>

            {/* 친구 관리 버튼 */}
            <div className={styles.actions}>
                <button type="button" onClick={() => navigate('/friend/add')}>
                    <UserPlus size={17} /> 친구 추가
                </button>
                <button type="button" onClick={() => navigate('/friend/request')}>
                    <Inbox size={17} /> 받은 요청
                </button>
                <button type="button" onClick={() => navigate('/friend/sent')}>
                    <Send size={17} /> 보낸 요청
                </button>
            </div>

            {/* 친구 수 */}
            <div className={styles.summary}>
                <Users size={18} />
                <span>등록된 친구</span>
                <strong>{friends.length}명</strong>
            </div>

            {/* 친구 목록 */}
            <div className={styles.list}>
                {loading ? (
                    <div className={styles.empty}>친구 목록을 불러오는 중입니다.</div>
                ) : friends.length > 0 ? (
                    friends.map(friend => (
                        <div key={friend.num} className={styles.friend}>
                            <div className={styles.avatar}>
                                <UserRound size={23} />
                            </div>
                            <div className={styles.info}>
                                <strong>{friend.member_nick || '알 수 없는 회원'}</strong>
                                <span>친구</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <Users size={30} />
                        <h3>등록된 친구가 없습니다.</h3>
                        <p>친구 추가에서 새로운 친구를 찾아보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyFriend;
