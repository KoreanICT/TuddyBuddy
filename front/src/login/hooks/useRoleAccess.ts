import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { parseJwt } from '../comp/jwtUtils';
import { MemberRole } from '../auth/roles';

/** 화면 표시용 JWT 역할 판정. 실제 API 권한은 서버에서 검사합니다. */
export const useRoleAccess = () => {
    const { token } = useAuth();
    const [tick, setTick] = useState(0);
    const decoded = token ? parseJwt(token) : null;
    const expiresAt = decoded?.exp;

    useEffect(() => {
        const refresh = () => setTick(value => value + 1);
        const remaining = expiresAt === undefined ? 0 : expiresAt * 1000 - Date.now();
        const timer = remaining > 0
            ? window.setTimeout(refresh, Math.min(remaining, 2147483647)) : undefined;
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [token, expiresAt, tick]);

    const role = decoded && decoded.exp > Date.now() / 1000 ? decoded.role : null;
    const hasRole = (allowedRoles: readonly MemberRole[]) => role !== null && allowedRoles.includes(role);
    return { role, hasRole, isAuthenticated: role !== null };
};
