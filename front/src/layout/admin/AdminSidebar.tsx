import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../login/authHttp';
import { useAuth } from '../../login/hooks/useAuth';
import { useRoleAccess } from '../../login/hooks/useRoleAccess';
import styles from './adminSidebar.module.css';
import RoleGate from '../../login/auth/RoleGate';
import { ROLE_ACCESS } from '../../login/auth/roles';

const AdminSidebar: React.FC = () => {
    const { token, memberNum } = useAuth();
    const { hasRole } = useRoleAccess();
    const canManage = hasRole(ROLE_ACCESS.admin);
    const { pathname } = useLocation();
    const [pending, setPending] = useState<{owner: number | null; count: number}>({owner: null, count: 0});
    useEffect(() => {
        setPending({owner: memberNum, count: 0});
        if (!token || !canManage) return;
        const controller = new AbortController();
        let busy = false;
        const refresh = async () => {
            if (busy || document.hidden || controller.signal.aborted) return;
            busy = true;
            try {
                const response = await axios.get<{total: number}>(`${BACKEND_URL}/api/report/reportStatistics`, {
                    params: {status: 'PENDING'}, headers: {Authorization: `Bearer ${token}`},
                    signal: controller.signal, timeout: 10000
                });
                if (!controller.signal.aborted) setPending({owner: memberNum, count: response.data.total});
            } catch {
                // Retain the last known count on a temporary network failure.
            } finally { busy = false; }
        };
        void refresh();
        const listener = () => { void refresh(); };
        const interval = window.setInterval(listener, 30000);
        window.addEventListener('focus', listener);
        window.addEventListener('report-status-changed', listener);
        document.addEventListener('visibilitychange', listener);
        return () => {
            controller.abort(); window.clearInterval(interval);
            window.removeEventListener('focus', listener);
            window.removeEventListener('report-status-changed', listener);
            document.removeEventListener('visibilitychange', listener);
        };
    }, [token, memberNum, canManage, pathname]);
    return (
        <aside className={styles.sidebar}>
            <div className={styles.title}>
                관리자 메뉴
            </div>

            <RoleGate allowedRoles={ROLE_ACCESS.admin}>
            <nav className={styles.menu}>
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }>
                    대시보드
                </NavLink>

                <NavLink
                    to="/admin/memberManagement"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }>
                    회원 관리
                </NavLink>

                <NavLink
                    to="/admin/notice"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }>
                    공지 관리
                </NavLink>

                <NavLink
                    to="/admin/boardManagement"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }>
                    게시판 관리
                </NavLink>



                <NavLink
                    to="/admin/reportList"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    신고 관리
                    {pending.owner === memberNum && pending.count > 0 && <span className={styles.reportBadge}
                        role="status" aria-label={`처리 대기 신고 ${pending.count}건`}>!</span>}
                </NavLink>

                <NavLink
                    to="/admin/studyManagement"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }>
                    스터디 관리
                </NavLink>
                <RoleGate allowedRoles={ROLE_ACCESS.manageSelfStudy}>
                <NavLink
                    to="/admin/selfstudy"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    셀프스터디 관리
                </NavLink>
                </RoleGate>
                <NavLink
                    to="/admin/activityLogs"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    사용자 활동 로그
                </NavLink>
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }>
                    홈으로
                </NavLink>
            </nav>
            </RoleGate>
        </aside>
    );
};

export default AdminSidebar;
