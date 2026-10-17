import React from 'react';
import { MemberRole } from './roles';
import { useRoleAccess } from '../hooks/useRoleAccess';

interface RoleGateProps {
    allowedRoles: readonly MemberRole[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const RoleGate: React.FC<RoleGateProps> = ({ allowedRoles, children, fallback = null }) => {
    const { hasRole } = useRoleAccess();
    return <>{hasRole(allowedRoles) ? children : fallback}</>;
};

export default RoleGate;
