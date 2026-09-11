import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './navbar.module.css';
import UserMenu from './UserMenu';

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
                    <div className={styles.logo}>
                        프로젝트 로고
                    </div>

                    {/* Navigation */}
                    <ul className={styles.menu}>
                        <li>
                            <NavLink to="/" className={linkClass}>
                                홈
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/community" className={linkClass}>
                                커뮤니티
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/homeGroup" className={linkClass}>
                                스터디룸
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/SelfStudy" className={linkClass}>
                                개인 스터디
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/statistics" className={linkClass}>
                                평가분석
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/videoSummary" className={linkClass}>
                                영상 요약
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/friend/add" className={linkClass}>
                                친구 추가
                            </NavLink>
                        </li>
                    </ul>

                    {/* User */}
                    <UserMenu />

                </div>
            </div>
        </nav>
    );
};

export default Navbar;