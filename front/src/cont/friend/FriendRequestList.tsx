
 // 주용현

import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserCheck, UserX, Users } from 'lucide-react';

import styles from './friendRequestList.module.css';
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

const FriendRequestList: React.FC = () => {
    const [requests, setRequests] = useState<FriendVO[]>([]);
    const { memberNum, token } = useAuth();
    const processingRef = useRef(false);
    const [processing, setProcessing] = useState<number | null>(null);

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    // 받은 친구 요청 목록 조회
    const fetchRequestList = useCallback(async () => {
        if (!token || memberNum == null) return;

        try {
            const urls = "http://localhost:80/back/api/friend/friendRequestList";
            const response = await axios.get(urls, {
                headers: getAuthHeaders(),
                params: { response_num: memberNum }
            });

            setRequests(response.data);
        } catch (error) {
            console.error('받은 친구 요청 조회 실패:', error);
            setRequests([]);
        }
    }, [memberNum, token, getAuthHeaders]);

    useEffect(() => {
        if (!token || memberNum == null) {
            setRequests([]);
            return;
        }
        fetchRequestList();
    }, [memberNum, token, fetchRequestList]);

    // 친구 요청 수락
    const handleAccept = async (friendNum: number) => {
        if (processingRef.current) return;
        if (!token || memberNum == null) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        processingRef.current = true;
        setProcessing(friendNum);
        try {
            const urls = "http://localhost:80/back/api/friend/friendAccept";

            await axios.put(urls, null, {
                headers: getAuthHeaders(),
                params: {
                    num: friendNum,
                    response_num: memberNum
                }
            });

            setRequests(prev => prev.filter(request => request.num !== friendNum));
            alert('친구 요청을 수락했습니다.');
        } catch (error) {
            console.error('친구 요청 수락 실패:', error);
            alert('친구 요청 수락에 실패했습니다.');
            await fetchRequestList();
        } finally {
            processingRef.current = false;
            setProcessing(null);
        }
    };

    // 친구 요청 거절
    const handleReject = async (friendNum: number) => {
        if (processingRef.current) return;
        if (!token || memberNum == null) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const confirmed = window.confirm('친구 요청을 거절하시겠습니까?');
        if (!confirmed) return;

        processingRef.current = true;
        setProcessing(friendNum);
        try {
            const urls = "http://localhost:80/back/api/friend/friendReject";

            await axios.put(urls, null, {
                headers: getAuthHeaders(),
                params: {
                    num: friendNum,
                    response_num: memberNum
                }
            });

            setRequests(prev => prev.filter(request => request.num !== friendNum));
            alert('친구 요청을 거절했습니다.');
        } catch (error) {
            console.error('친구 요청 거절 실패:', error);
            alert('친구 요청 거절에 실패했습니다.');
            await fetchRequestList();
        } finally {
            processingRef.current = false;
            setProcessing(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>받은 친구 요청</h1>
                        <p>나에게 온 친구 요청을 확인하고 수락하거나 거절할 수 있습니다.</p>
                    </div>
                </div>

                {/* 친구 관리 메뉴 */}
                <FriendMenu />

                {/* Summary */}
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <Users size={17} />
                        <span>받은 요청</span>
                        <strong>{requests.length}</strong>
                    </div>
                </div>

                {/* List Header */}
                <div className={styles.listHeader}>
                    <span>친구 요청 {requests.length}건</span>
                </div>

                {/* Request List */}
                <div className={styles.list}>
                    {requests.length > 0 ? (
                        requests.map(request => (
                            <div key={request.num} className={styles.request}>
                                <div className={styles.profile}>
                                    {request.counterpart_nick
                                        ? <ProfileCard memberNum={request.request_num} />
                                        : <div className={styles.profileImage} aria-hidden="true">?</div>}

                                    <div className={styles.info}>
                                        <strong>{request.counterpart_nick || '탈퇴한 회원'}</strong>
                                        <span>요청일 {request.requested_date}</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.acceptButton}
                                        disabled={processing !== null}
                                        onClick={() => handleAccept(request.num)}
                                    >
                                        <UserCheck size={16} />
                                        수락
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.rejectButton}
                                        disabled={processing !== null}
                                        onClick={() => handleReject(request.num)}
                                    >
                                        <UserX size={16} />
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>
                                <Users size={30} />
                            </div>
                            <h2>받은 친구 요청이 없습니다.</h2>
                            <p>새로운 친구 요청이 오면 이곳에서 확인할 수 있습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendRequestList;
