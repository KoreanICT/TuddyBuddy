import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { parseJwt } from '../comp/jwtUtils';
import { useAuth } from '../hooks/useAuth';
import { MemberRole } from './roles';
import { refreshAccessToken } from '../authHttp';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: MemberRole[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { token } = useAuth();
  const [expiryTick, refreshExpiry] = useState(0);
  const [refreshFailure, setRefreshFailure] = useState('');
  const decoded = token ? parseJwt(token) : null;
  const expiresAt = decoded?.exp;

  useEffect(() => {
    if (!token || expiresAt === undefined) return;
    let active = true;
    setRefreshFailure('');
    const remaining = expiresAt * 1000 - Date.now();
    if (remaining <= 0) {
      void refreshAccessToken().catch(() => {
        if (active) setRefreshFailure('로그인 연결을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.');
      });
      return () => { active = false; };
    }
    const timer = window.setTimeout(() => refreshExpiry(value => value + 1), Math.min(remaining, 2147483647));
    return () => window.clearTimeout(timer);
  }, [token, expiresAt, expiryTick]);

  if (!decoded) {
    const redirect = encodeURIComponent(location.pathname + location.search + location.hash);
    return <Navigate to={`/auth/member?redirect=${redirect}`} replace />;
  }

  if (decoded.exp <= Date.now() / 1000) {
    return refreshFailure ? (
      <div className="container mt-5" role="alert">
        <p>{refreshFailure}</p>
        <button type="button" onClick={() => refreshExpiry(value => value + 1)}>다시 시도</button>
      </div>
    ) : <div className="container mt-5" role="status">로그인 상태를 갱신하고 있습니다.</div>;
  }

  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    return (
      <div className="container mt-5" role="alert">
        <h3>접근 권한이 없습니다.</h3>
        <p>관리자 권한이 필요한 페이지입니다.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
