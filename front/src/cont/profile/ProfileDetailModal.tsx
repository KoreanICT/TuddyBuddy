import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../login/hooks/useAuth';
import ReportButton from '../report/ReportButton';
import styles from './profile.module.css';

interface ProfileDetailModalProps {
    memberNum: number;
    onClose: () => void;
}

const API_URL = 'http://localhost:80/back/api';

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ memberNum, onClose }) => {
    const { memberNum: myMemberNum, token } = useAuth();
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const requestRef = useRef(false);
    const [nick, setNick] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [sent, setSent] = useState(false);
    const [message, setMessage] = useState('');
    const valid = Number.isSafeInteger(memberNum) && memberNum > 0 && memberNum !== Number(myMemberNum);
    const getAuthHeaders = () => ({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog?.showModal();
        return () => { dialog?.close(); };
    }, []);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setNick('');
        setError('');
        setSent(false);
        setMessage('');
        if (!valid || !token) {
            setError(!token ? '로그인이 필요합니다.' : '다른 회원의 프로필만 볼 수 있습니다.');
            setLoading(false);
            return;
        }
        void axios.get<{ MEMBER_NICK?: string; member_nick?: string }>(`${API_URL}/member/memberProfile`, {
            headers: { Authorization: `Bearer ${token}` }, params: { member_num: memberNum }
        }).then(response => {
            if (!active) return;
            const nickname = response.data.member_nick ?? response.data.MEMBER_NICK;
            if (!nickname) throw new Error('회원 정보 없음');
            setNick(nickname);
        }).catch(() => {
            if (active) setError('회원 정보를 불러올 수 없습니다.');
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [memberNum, token, valid]);

    const addFriend = async () => {
        if (!valid || !token || !nick || requestRef.current || sent) return;
        requestRef.current = true;
        setAdding(true);
        setMessage('');
        try {
            const formData = new FormData();
            formData.append('response_num', String(memberNum));
            await axios.post(`${API_URL}/friend/friendAdd`, formData, { headers: getAuthHeaders() });
            setSent(true);
            setMessage('친구 요청을 보냈습니다.');
        } catch (err) {
            const status = axios.isAxiosError(err) ? err.response?.status : undefined;
            if (status === 409) setSent(true);
            setMessage(status === 409 ? '이미 친구이거나 친구 요청이 진행 중입니다.' : '친구 요청에 실패했습니다. 다시 시도해주세요.');
        } finally {
            requestRef.current = false;
            setAdding(false);
        }
    };

    return createPortal(
        <dialog ref={dialogRef} className={styles.modal} aria-label="회원 프로필"
            onCancel={event => { event.preventDefault(); onClose(); }}
            onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
            <div className={styles.content}>
                <button type="button" className={styles.close} aria-label="프로필 닫기" onClick={onClose}>×</button>
                <h2>회원 프로필</h2>
                {loading ? <p role="status">불러오는 중...</p> : error ? <p role="alert">{error}</p> : (
                    <>
                        <img className={styles.avatar} src={`${process.env.PUBLIC_URL}/images/default-profile.svg`} alt="회원 프로필" />
                        <h3>{nick}</h3>
                        <div className={styles.actions}>
                            <button type="button" disabled={adding || sent} onClick={addFriend}>
                                {sent ? '요청 완료' : adding ? '요청 중...' : '친구 추가'}
                            </button>
                            <ReportButton type="user" targetNum={memberNum}>신고하기</ReportButton>
                        </div>
                        {message && <p role="status">{message}</p>}
                    </>
                )}
            </div>
        </dialog>, document.body
    );
};

export default ProfileDetailModal;
