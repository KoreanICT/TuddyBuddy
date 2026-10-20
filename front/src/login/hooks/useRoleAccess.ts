import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { parseJwt } from '../comp/jwtUtils';
import { MemberRole } from '../auth/roles';
import { refreshAccessToken } from '../authHttp';
import { currentToken } from '../session';

const REFRESH_RETRY_DELAY = 30_000;

/** 화면 표시용 JWT 역할 판정. 실제 API 권한은 서버에서 검사합니다. */
export const useRoleAccess = () => {
    const { token } = useAuth();
    const [tick, setTick] = useState(0);
    const decoded = token ? parseJwt(token) : null;
    const expiresAt = decoded?.exp;

    useEffect(() => {
        let active = true;
        let timer: number | undefined;
        const refresh = () => setTick(value => value + 1);
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') refresh();
        };

        if (token && expiresAt !== undefined) {
            const remaining = expiresAt * 1000 - Date.now();
            if (remaining > 0) {
                timer = window.setTimeout(refresh, Math.min(remaining, 2147483647));
            } else {
                // 공통 함수가 동시 요청을 합치고, 갱신 인증 실패(401) 시 세션을 정리합니다.
                void refreshAccessToken().catch(() => {
                    if (active && currentToken() === token) {
                        timer = window.setTimeout(refresh, REFRESH_RETRY_DELAY);
                    }
                });
            }
        }

        window.addEventListener('focus', refresh);
        window.addEventListener('online', refresh);
        document.addEventListener('visibilitychange', refreshWhenVisible);
        return () => {
            active = false;
            window.clearTimeout(timer);
            window.removeEventListener('focus', refresh);
            window.removeEventListener('online', refresh);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, [token, expiresAt, tick]);

    // 갱신 중 또는 일시적인 통신 실패에는 표시를 유지합니다. 실제 접근은 RequireAuth와 서버가 검사합니다.
    const role = decoded && currentToken() === token ? decoded.role : null;
    const hasRole = (allowedRoles: readonly MemberRole[]) => role !== null && allowedRoles.includes(role);
    return { role, hasRole, isAuthenticated: role !== null };
};
