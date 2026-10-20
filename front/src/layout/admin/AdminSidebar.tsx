import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './adminSidebar.module.css';
import RoleGate from '../../login/auth/RoleGate';
import { ROLE_ACCESS } from '../../login/auth/roles';

const AdminSidebar: React.FC = () => {
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
                <NavLink
                    to="/admin/activityLogs"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    사용자 활동 로그
                </NavLink>
                </RoleGate>
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
