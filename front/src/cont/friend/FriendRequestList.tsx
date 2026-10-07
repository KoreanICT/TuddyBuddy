import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    UserRound,
    UserCheck,
    UserX,
    Users
} from 'lucide-react';

import styles from './friendRequestList.module.css';

interface FriendVO {
    num: number;
    status: string;
    requested_date: string;
    responsed_date: string | null;
    request_num: number;
    response_num: number;
}

const FriendRequestList: React.FC = () => {

    const [requests, setRequests] = useState<FriendVO[]>([]);

    // TODO: 로그인 연결 후 실제 로그인 회원 번호 사용
    const memberNum = 1;

    // 받은 친구 요청 목록 조회
    const fetchRequestList = async () => {
        try {
            const urls = "http://localhost:80/back/api/friend/friendRequestList";

            const response = await axios.get(urls, {
                params: {
                    response_num: memberNum
                }
            });

            setRequests(response.data);

        } catch (error) {
            console.error('받은 친구 요청 조회 실패:', error);
            setRequests([]);
        }
    };

    useEffect(() => {
        fetchRequestList();
    }, []);

    // 친구 요청 수락
    const handleAccept = async (friendNum: number) => {
        try {
            const urls = "http://localhost:80/back/api/friend/friendAccept";

            const formData = new FormData();
            formData.append('num', String(friendNum));

            await axios.put(urls, formData);

            setRequests(prev => prev.filter(request => request.num !== friendNum));

            alert('친구 요청을 수락했습니다.');

        } catch (error) {
            console.error('친구 요청 수락 실패:', error);
            alert('친구 요청 수락에 실패했습니다.');
        }
    };

    // 친구 요청 거절
    const handleReject = async (friendNum: number) => {
        const confirmed = window.confirm('친구 요청을 거절하시겠습니까?');

        if (!confirmed) {
            return;
        }

        try {
            const urls = "http://localhost:80/back/api/friend/friendReject";

            const formData = new FormData();
            formData.append('num', String(friendNum));

            await axios.put(urls, formData);

            setRequests(prev => prev.filter(request => request.num !== friendNum));

            alert('친구 요청을 거절했습니다.');

        } catch (error) {
            console.error('친구 요청 거절 실패:', error);
            alert('친구 요청 거절에 실패했습니다.');
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

                            <div
                                key={request.num}
                                className={styles.request}
                            >

                                <div className={styles.profile}>

                                    <div className={styles.profileImage}>
                                        <UserRound size={25} />
                                    </div>

                                    <div className={styles.info}>

                                        {/* TODO: 회원 정보 API 연결 후 loginId 출력 */}
                                        <strong>
                                            회원 #{request.request_num}
                                        </strong>

                                        {/* TODO: 회원 정보 API 연결 후 name 출력 */}
                                        <span>
                                            친구 요청
                                        </span>

                                    </div>

                                </div>

                                <div className={styles.actions}>

                                    <button
                                        type="button"
                                        className={styles.acceptButton}
                                        onClick={() => handleAccept(request.num)}
                                    >
                                        <UserCheck size={16} />
                                        수락
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.rejectButton}
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

                            <p>
                                새로운 친구 요청이 오면 이곳에서 확인할 수 있습니다.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default FriendRequestList;