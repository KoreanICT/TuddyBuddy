import { BACKEND_URL } from '../../login/authHttp';

// 주용현

import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserRound, Trash2, Users } from 'lucide-react';

import styles from './friendList.module.css';
import { useAuth } from '../../login/hooks/useAuth';
import FriendMenu from './FriendMenu';
import ReportButton from '../report/ReportButton';
import FriendStudyInviteModal from './FriendStudyInviteModal';

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

const FriendList: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
    const [friends, setFriends] = useState<FriendVO[]>([]);
    const [inviteFriend, setInviteFriend] = useState<FriendVO | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FriendVO | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteNotice, setDeleteNotice] = useState('');
    const deleteDialog = useRef<HTMLDialogElement>(null);
    const cancelButton = useRef<HTMLButtonElement>(null);
    const deleteRequest = useRef<AbortController | null>(null);

    // 커스텀 훅에서 member_num 가져오기
    const { memberNum, token } = useAuth();

    useEffect(() => {
        setDeleteTarget(null);
        setDeleteNotice('');
        return () => { deleteRequest.current?.abort(); deleteRequest.current = null; };
    }, [memberNum, token]);

    useEffect(() => {
        if (!deleteTarget) return;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        const dialog = deleteDialog.current;
        dialog?.showModal();
        document.body.style.overflow = 'hidden';
        cancelButton.current?.focus();
        return () => {
            dialog?.close();
            document.body.style.overflow = previousOverflow;
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, [deleteTarget]);

    const closeDelete = () => { if (!deleteRequest.current) setDeleteTarget(null); };

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
            const urls = `${BACKEND_URL}/api/friend/friendList`;
            const response = await axios.get<FriendVO[]>(urls, {
                headers: getAuthHeaders(),
                params: { member_num: memberNum }
            });

            // 친구 회원 번호로 닉네임 조회
            const friendProfiles = await Promise.all(response.data.map(async friend => {
                try {
                    const profileUrl = `${BACKEND_URL}/api/member/memberProfile`;
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
    const handleDeleteFriend = async () => {
        if (!token || memberNum == null || !deleteTarget || deleteRequest.current) return;
        const friendNum = deleteTarget.num;
        const controller = new AbortController();
        deleteRequest.current = controller;
        setDeleting(true);
        setDeleteError('');

        try {
            const urls = `${BACKEND_URL}/api/friend/friendDelete`;

            await axios.delete(urls, {
                signal: controller.signal,
                timeout: 15000,
                headers: getAuthHeaders(),
                params: {
                    num: friendNum,
                    member_num: memberNum
                }
            });

            if (controller.signal.aborted) return;
            setFriends(prev => prev.filter(friend => friend.num !== friendNum));
            setDeleteTarget(null);
            setDeleteNotice('친구 목록에서 삭제되었습니다.');
        } catch (error) {
            if (!controller.signal.aborted) setDeleteError('삭제를 완료하지 못했습니다. 목록을 확인한 후 다시 시도해주세요.');
        } finally {
            if (deleteRequest.current === controller) {
                deleteRequest.current = null;
                setDeleting(false);
            }
        }
    };

    return (
        <div className={`${styles.page} ${embedded ? styles.embeddedPage : ''}`}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>내 친구</h1>
                        <p>등록된 친구를 확인하고 관리할 수 있습니다.</p>
                    </div>
                </div>

                {/* 친구 관리 메뉴 */}
                {!embedded && <FriendMenu />}

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
                {deleteNotice && <p className={styles.deleteNotice} role="status">{deleteNotice}</p>}
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
                                    <button type="button" className={styles.inviteButton}
                                        onClick={() => setInviteFriend(friend)} aria-haspopup="dialog"
                                        aria-label={`${friend.member_nick || '친구'}님에게 스터디 초대 문구 만들기`}>스터디 초대</button>
                                    <ReportButton type="user" targetNum={getFriendMemberNum(friend)}
                                        aria-label={`${friend.member_nick || '친구'} 회원 신고`}>신고</ReportButton>
                                    <button
                                        type="button"
                                        className={styles.deleteButton}
                                        onClick={() => { setDeleteError(''); setDeleting(false); setDeleteTarget(friend); }}
                                        aria-haspopup="dialog"
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
            {inviteFriend && <FriendStudyInviteModal key={inviteFriend.num}
                friendNick={inviteFriend.member_nick || '친구'} onClose={() => setInviteFriend(null)} />}
            {deleteTarget && createPortal(
                <dialog ref={deleteDialog} className={styles.deleteDialog} aria-labelledby="friend-delete-title"
                    aria-describedby="friend-delete-description" onCancel={event => { event.preventDefault(); closeDelete(); }}
                    onClick={event => { if (event.target === event.currentTarget) closeDelete(); }}>
                    <div className={styles.deleteDialogBody}>
                        <div className={styles.deleteDialogIcon}><Trash2 size={26} aria-hidden="true" /></div>
                        <h2 id="friend-delete-title">친구를 삭제할까요?</h2>
                        <p id="friend-delete-description">친구 목록에서 아래 회원을 삭제합니다.<br />다시 친구가 되려면 새로운 요청이 필요해요.</p>
                        <div className={styles.deleteFriendCard}><UserRound size={22} aria-hidden="true" /><strong>{deleteTarget.member_nick || '알 수 없는 회원'}</strong></div>
                        {deleteError && <p className={styles.deleteError} role="alert">{deleteError}</p>}
                        <div className={styles.deleteDialogActions}>
                            <button ref={cancelButton} type="button" disabled={deleting} onClick={closeDelete}>취소</button>
                            <button type="button" disabled={deleting} onClick={() => void handleDeleteFriend()}>{deleting ? '삭제 중…' : '친구 삭제'}</button>
                        </div>
                    </div>
                </dialog>, document.body)}
        </div>
    );
};

export default FriendList;
