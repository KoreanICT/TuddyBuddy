import React, { useState } from 'react';
import { useAuth } from '../../login/hooks/useAuth';
import ProfileDetailModal from './ProfileDetailModal';
import styles from './profile.module.css';

export const DEFAULT_PROFILE_IMAGE = `${process.env.PUBLIC_URL}/images/default-profile.svg`;

export interface ProfileCardProps {
    memberNum: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ memberNum }) => {
    const { memberNum: myMemberNum, token } = useAuth();
    const [open, setOpen] = useState(false);
    if (!Number.isSafeInteger(memberNum) || memberNum <= 0 || memberNum === Number(myMemberNum)) return null;

    return (
        <>
            <button type="button" className={styles.card} aria-label="회원 프로필 보기"
                aria-haspopup="dialog" disabled={!token} onClick={() => setOpen(true)}>
                <img src={DEFAULT_PROFILE_IMAGE} alt="회원 프로필" />
            </button>
            {open && <ProfileDetailModal key={`${memberNum}:${myMemberNum}`} memberNum={memberNum}
                onClose={() => setOpen(false)} />}
        </>
    );
};

export default ProfileCard;
