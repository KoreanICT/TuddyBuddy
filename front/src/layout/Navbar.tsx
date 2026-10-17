import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './navbar.module.css';
import UserMenu from './UserMenu';
import RoleGate from '../login/auth/RoleGate';
import { ROLE_ACCESS } from '../login/auth/roles';

const Navbar: React.FC = () => {
    // NavLink의 isActive를 이용해서 현재 활성화된 메뉴에 active 클래스 추가
    const linkClass = ({ isActive }: { isActive: boolean }) =>
        isActive
            ? `${styles.link} ${styles.active}`
            : styles.link;

    return (
        <nav className={styles.navbar}>
            <div className="container">
                <div className={styles.inner}>

                    {/* Logo */}
                    <NavLink to="/" className={styles.logo}>
                        <img
                            src="/images/logo.png"
                            alt="TuddyBuddy"
                            className={styles.logoImage}
                        />
                    </NavLink>

                    {/* Navigation */}
                    <ul className={styles.menu}>
                        <li>
                            <NavLink to="/" end className={linkClass}>
                                홈
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/notice" className={linkClass}>
                                공지사항
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/community" className={linkClass}>
                                커뮤니티
                            </NavLink>
                        </li>

                        <RoleGate allowedRoles={ROLE_ACCESS.member}>
                        <li>
                            <NavLink to="/group" className={linkClass}>
                                스터디룸
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/selfStudy" className={linkClass}>
                                개인 스터디
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/statistics" className={linkClass}>
                                평가분석
                            </NavLink>
                        </li>
                        </RoleGate>
                    </ul>

                    {/* User */}
                    <UserMenu />

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
