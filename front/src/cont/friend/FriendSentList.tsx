import { BACKEND_URL } from '../../login/authHttp';

 // 주용현

import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Clock, UserCheck, UserX } from 'lucide-react';

import styles from './friendSentList.module.css';
import { useAuth } from '../../login/hooks/useAuth';
import FriendMenu from './FriendMenu';
import ProfileCard from '../profile/ProfileCard';

interface FriendVO {
    num: number;
    status: string;
    requested_date: string;
    responsed_date: string | null;
    request_num: number;
    response_num: number;
    counterpart_nick: string | null;
}

const FriendSentList: React.FC = () => {
    const [sentList, setSentList] = useState<FriendVO[]>([]);
    const { memberNum, token } = useAuth();
    const cancellingRef = useRef(false);
    const [cancelling, setCancelling] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    // 보낸 친구 요청 목록 조회
    const fetchSentList = useCallback(async () => {
        if (!token || memberNum == null) return;

        setLoading(true);
        setErrorMessage('');
        try {
            const urls = `${BACKEND_URL}/api/friend/friendResponseList`;
            const response = await axios.get(urls, {
                headers: getAuthHeaders(),
                params: { request_num: memberNum }
            });

            setSentList(response.data);
        } catch (error) {
            console.error('보낸 친구 요청 조회 실패:', error);
            setSentList([]);
            setErrorMessage('보낸 친구 요청을 불러오지 못했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    }, [memberNum, token, getAuthHeaders]);

    useEffect(() => {
        if (!token || memberNum == null) {
            setSentList([]);
            setLoading(false);
            return;
        }
        fetchSentList();
    }, [memberNum, token, fetchSentList]);

    const handleCancel = async (friendNum: number) => {
        if (!token || cancellingRef.current) return;
        if (!window.confirm('보낸 친구 요청을 취소하시겠습니까?')) return;
        cancellingRef.current = true;
        setCancelling(friendNum);
        try {
            await axios.delete(`${BACKEND_URL}/api/friend/friendCancel`, {
                headers: getAuthHeaders(), params: { num: friendNum }
            });
            setSentList(previous => previous.filter(friend => friend.num !== friendNum));
        } catch (error) {
            alert(axios.isAxiosError(error) && typeof error.response?.data === 'string'
                ? error.response.data : '친구 요청을 취소하지 못했습니다. 다시 시도해주세요.');
            await fetchSentList();
        } finally {
            cancellingRef.current = false;
            setCancelling(null);
        }
    };

    // 상태 출력
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '대기 중';
            case 'ACCEPTED':
                return '수락됨';
            case 'REJECTED':
                return '거절됨';
            default:
                return status;
        }
    };

    // 상태 아이콘
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock size={15} />;
            case 'ACCEPTED':
                return <UserCheck size={15} />;
            case 'REJECTED':
                return <UserX size={15} />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>보낸 친구 요청</h1>
                        <p>내가 보낸 친구 요청과 처리 상태를 확인할 수 있습니다.</p>
                    </div>
                </div>

                {/* 친구 관리 메뉴 */}
                <FriendMenu />

                {/* Summary */}
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <Send size={17} />
                        <span>보낸 요청</span>
                        <strong>{sentList.length}</strong>
                    </div>
                </div>

                {/* List Header */}
                <div className={styles.listHeader}>
                    <span>친구 요청 {sentList.length}건</span>
                </div>

                {/* Sent List */}
                <div className={styles.list}>
                    {loading ? <p role="status" className={styles.empty}>보낸 친구 요청을 불러오는 중입니다.</p>
                    : errorMessage ? <div className={styles.empty} role="alert">
                        <p>{errorMessage}</p>
                        <button type="button" className={styles.cancelButton} onClick={() => void fetchSentList()}>다시 시도</button>
                    </div> : sentList.length > 0 ? (
                        sentList.map(friend => (
                            <div key={friend.num} className={styles.request}>
                                <div className={styles.profile}>
                                    {friend.counterpart_nick
                                        ? <ProfileCard memberNum={friend.response_num} />
                                        : <div className={styles.profileImage} aria-hidden="true">?</div>}

                                    <div className={styles.info}>
                                        <strong>{friend.counterpart_nick || '탈퇴한 회원'}</strong>
                                        <span>요청일 {friend.requested_date}</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                <div className={`${styles.status} ${
                                    friend.status === 'PENDING'
                                        ? styles.pending
                                        : friend.status === 'ACCEPTED'
                                            ? styles.accepted
                                            : styles.rejected
                                }`}>
                                    {getStatusIcon(friend.status)}
                                    {getStatusText(friend.status)}
                                </div>
                                {friend.status === 'PENDING' && (
                                    <button type="button" className={styles.cancelButton}
                                        disabled={cancelling !== null} onClick={() => void handleCancel(friend.num)}>
                                        {cancelling === friend.num ? '취소 중...' : '요청 취소'}
                                    </button>
                                )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>
                                <Send size={30} />
                            </div>
                            <h2>보낸 친구 요청이 없습니다.</h2>
                            <p>친구 추가에서 새로운 친구 요청을 보내보세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendSentList;
