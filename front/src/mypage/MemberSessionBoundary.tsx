import React, { useSyncExternalStore } from 'react';
import { useAuth } from '../login/hooks/useAuth';
import { memberSessionKey } from '../login/session';

const subscribe = (notify: () => void) => {
    const update = () => notify();
    window.addEventListener('storage', update);
    window.addEventListener('focus', update);
    return () => {
        window.removeEventListener('storage', update);
        window.removeEventListener('focus', update);
    };
};

/** 계정이 바뀌면 이전 프로필·입력값·탈퇴 확인·모달을 통째로 폐기합니다. */
const MemberSessionBoundary: React.FC<{ children: (key: string) => React.ReactNode }> = ({ children }) => {
    useAuth(); // 같은 탭의 로그인/로그아웃은 Redux 구독으로도 갱신합니다.
    const key = useSyncExternalStore(subscribe, memberSessionKey, () => '');
    if (!key) return <p role="alert">로그인이 필요합니다. 다시 로그인해주세요.</p>;
    return <React.Fragment key={key}>{children(key)}</React.Fragment>;
};

export default MemberSessionBoundary;
