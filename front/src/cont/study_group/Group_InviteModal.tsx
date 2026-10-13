import React, { useState } from 'react';
import { joinGroupByInviteCode } from './GroupAPI';
import styles from './group.module.css';

interface GroupInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoined?: () => void;
}

export const Group_InviteModal: React.FC<GroupInviteModalProps> = ({
    isOpen,
    onClose,
    onJoined
}) => {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) {
        return null;
    }

    const handleJoin = async () => {
        const code = inviteCode.trim();

        if (!code) {
            alert('초대코드를 입력해주세요.');
            return;
        }

        try {
            setLoading(true);

            await joinGroupByInviteCode(code);

            alert('스터디룸에 가입되었습니다.');

            setInviteCode('');
            onJoined?.();
            onClose();
        } catch (error) {
            console.error(error);
            alert('초대코드를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={styles.invite_modal_overlay}
            onClick={onClose}
        >
            <div
                className={styles.invite_modal}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={styles.invite_modal_title}>
                    초대코드로 입장하기
                </h2>

                <p className={styles.invite_modal_desc}>
                    초대받은 스터디룸의 초대코드를 입력해주세요.
                </p>

                <input
                    type="text"
                    value={inviteCode}
                    maxLength={10}
                    placeholder="초대코드 입력"
                    onChange={(e) =>
                        setInviteCode(e.target.value)
                    }
                    className={styles.invite_modal_input}
                />

                <div className={styles.invite_modal_actions}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${styles.study_action_btn} ${styles.secondary}`}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleJoin}
                        className={`${styles.study_action_btn} ${styles.primary}`}
                    >
                        {loading ? '입장 중...' : '입장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};