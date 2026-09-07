import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './userMenu.module.css';

const UserMenu: React.FC = () => {
    // TODO: 추후 useAuth()로 교체
    const [isLogin, setIsLogin] = useState(true);
    const [isAdmin, setIsAdmin] = useState(true)
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => {
        setIsOpen(false);
    };

    // 로그인하지 않은 경우
    if (!isLogin) {
        return (
            <div className={styles.userMenu}>
                <Link to="/login" className={styles.authButton}>
                    로그인
                </Link>

                <Link to="/signup" className={styles.authButton}>
                    회원가입
                </Link>
            </div>
        );
    }

    else return (
        <>
            <div className={styles.userMenu}>
                <Link to="/login" className={styles.authButton}>
                    로그인
                </Link>

                <Link to="/signup" className={styles.authButton}>
                    회원가입
                </Link>
            </div>
            {/* 프로필 버튼 */}
            <div className={styles.userMenu}>
                <button
                    className={styles.profileButton}
                    onClick={() => setIsOpen(true)}
                    aria-label="개인 메뉴 열기"
                >
                    <span className={styles.profileIcon}>👤</span>
                    <span>내 계정</span>
                </button>
            </div>

            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={closeMenu}
            />

            {/* Side Menu */}
            <aside
                className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
            >
                {/* Drawer Header */}
                <div className={styles.drawerHeader}>
                    <div>
                        <span className={styles.drawerTitle}>
                            내 계정
                        </span>
                    </div>

                    <button
                        className={styles.closeButton}
                        onClick={closeMenu}
                        aria-label="개인 메뉴 닫기"
                    >
                        ×
                    </button>
                </div>

                {/* Menu */}
                <nav className={styles.drawerMenu}>
                    <NavLink to="/mypage" onClick={closeMenu}>
                        내정보
                    </NavLink>

                    <NavLink to="/learning" onClick={closeMenu}>
                        학습현황
                    </NavLink>

                    <NavLink to="/study/create" onClick={closeMenu}>
                        스터디 생성
                    </NavLink>

                    <NavLink to="/point" onClick={closeMenu}>
                        포인트 구매
                    </NavLink>

                    {/* {isAdmin && ( */}
                    <NavLink to="/admin" onClick={closeMenu}>
                        관리자 메뉴
                    </NavLink>
                    {/* )} */}
                    <NavLink to="/friend/list" onClick={closeMenu}>
                        내 친구
                    </NavLink>
                    <NavLink to="/friend/code" onClick={closeMenu}>
                        내 스터던트 코드
                    </NavLink>
                </nav>

                {/* Logout */}
                <div className={styles.drawerFooter}>
                    <button onClick={() => console.log('logout')}>
                        로그아웃
                    </button>
                </div>
            </aside>
        </>
    );
};

export default UserMenu;