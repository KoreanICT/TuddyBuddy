import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { parseJwt } from '../comp/jwtUtils';
import { useAuth } from '../hooks/useAuth';
import { MemberRole } from './roles';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: MemberRole[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { token } = useAuth();
  const [expiryTick, refreshExpiry] = useState(0);
  const decoded = token ? parseJwt(token) : null;
  const expiresAt = decoded?.exp;

  useEffect(() => {
    if (expiresAt === undefined) return;
    const remaining = expiresAt * 1000 - Date.now();
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => refreshExpiry(value => value + 1), Math.min(remaining, 2147483647));
    return () => window.clearTimeout(timer);
  }, [token, expiresAt, expiryTick]);

  if (!decoded || decoded.exp <= Date.now() / 1000) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/member?redirect=${redirect}`} replace />;
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
