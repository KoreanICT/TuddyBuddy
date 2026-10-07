import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    UserRound,
    Send,
    Clock,
    UserCheck,
    UserX
} from 'lucide-react';

import styles from './friendSentList.module.css';

interface FriendVO {
    num: number;
    status: string;
    requested_date: string;
    responsed_date: string | null;
    request_num: number;
    response_num: number;
}

const FriendSentList: React.FC = () => {

    const [sentList, setSentList] = useState<FriendVO[]>([]);

    // TODO: 로그인 연결 후 실제 로그인 회원 번호 사용
    const memberNum = 1;

    // 보낸 친구 요청 목록 조회
    const fetchSentList = async () => {
        try {
            const urls = "http://localhost:80/back/api/friend/friendResponseList";

            const response = await axios.get(urls, {
                params: {
                    request_num: memberNum
                }
            });

            setSentList(response.data);

        } catch (error) {
            console.error('보낸 친구 요청 조회 실패:', error);
            setSentList([]);
        }
    };

    useEffect(() => {
        fetchSentList();
    }, []);

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

                    {sentList.length > 0 ? (

                        sentList.map(friend => (

                            <div
                                key={friend.num}
                                className={styles.request}
                            >

                                <div className={styles.profile}>

                                    <div className={styles.profileImage}>
                                        <UserRound size={25} />
                                    </div>

                                    <div className={styles.info}>

                                        {/* TODO: 회원 정보 API 연결 후 loginId 출력 */}
                                        <strong>
                                            회원 #{friend.response_num}
                                        </strong>

                                        {/* TODO: 회원 정보 API 연결 후 name 출력 */}
                                        <span>
                                            요청일 {friend.requested_date}
                                        </span>

                                    </div>

                                </div>

                                <div
                                    className={`${styles.status} ${
                                        friend.status === 'PENDING'
                                            ? styles.pending
                                            : friend.status === 'ACCEPTED'
                                                ? styles.accepted
                                                : styles.rejected
                                    }`}
                                >
                                    {getStatusIcon(friend.status)}
                                    {getStatusText(friend.status)}
                                </div>

                            </div>

                        ))

                    ) : (

                        <div className={styles.empty}>

                            <div className={styles.emptyIcon}>
                                <Send size={30} />
                            </div>

                            <h2>보낸 친구 요청이 없습니다.</h2>

                            <p>
                                친구 추가에서 새로운 친구 요청을 보내보세요.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default FriendSentList;