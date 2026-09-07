import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './adminSidebar.module.css';

const AdminSidebar: React.FC = () => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.title}>
                관리자 메뉴
            </div>

            <nav className={styles.menu}>
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    대시보드
                </NavLink>

                <NavLink
                    to="/admin/memberManagement"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    회원 관리
                </NavLink>

                <NavLink
                    to="/admin/boardManagement"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    게시판 관리
                </NavLink>

                <NavLink
                    to="/admin/reports"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    신고 관리
                </NavLink>

                <NavLink
                    to="/admin/notices"
                    className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                >
                    스터디 관리
                </NavLink>
            </nav>
        </aside>
    );
};

export default AdminSidebar;