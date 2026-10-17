import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { useAppDispatch, RootState } from '../login/reducers/store';
import { logoutAction } from '../login/authActions/authActions';


import styles from './userMenu.module.css';
import AuthModal from '../login/AuthModal';
import { parseJwt } from '../login/comp/jwtUtils';
import { isAdminRole } from '../login/auth/roles';

const UserMenu: React.FC = () => {

  // Redux JWT 로그인 상태
  const token = useSelector((state: RootState) => state.auth.token);
  const isLogin = Boolean(token);
  const decoded = token ? parseJwt(token) : null;
  const canOpenAdmin = decoded !== null && decoded.exp > Date.now() / 1000 && isAdminRole(decoded.role);

  const dispatch = useAppDispatch();

  // 내 계정 사이드 메뉴
  const [isOpen, setIsOpen] = useState(false);

  // 로그인/회원가입 팝업
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    const serverCleared = await dispatch(logoutAction());
    if (!serverCleared) window.alert('이 기기에서는 로그아웃되었습니다. 서버 연결 문제로 서버 세션 종료를 확인하지 못했습니다. 자동 로그인은 차단되며 다시 이용하려면 직접 로그인해주세요.');
    closeMenu();
  };

  // ================================
  // 로그인하지 않은 사용자
  // ================================
  if (!isLogin) {
    return (
      <>
        <div className={styles.userMenu}>
          <button
            type="button"
            className={styles.authButton}
            onClick={openAuthModal}
          >
            로그인/회원가입
          </button>
        </div>

        {isAuthModalOpen && (
          <AuthModal onClose={closeAuthModal} />
        )}
      </>
    );
  }

  // ================================
  // 로그인한 사용자
  // ================================
  return (
    <>
      {/* 프로필 버튼 */}
      <div className={styles.userMenu}>
        <button
          type="button"
          className={styles.profileButton}
          onClick={() => setIsOpen(true)}
          aria-label="개인 메뉴 열기"
        >
          <span className={styles.profileIcon}>
            👤
          </span>

          <span>내 계정</span>
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${
          isOpen ? styles.open : ''
        }`}
        onClick={closeMenu}
      />

      {/* Side Menu */}
      <aside
        className={`${styles.drawer} ${
          isOpen ? styles.open : ''
        }`}
      >
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div>
            <span className={styles.drawerTitle}>
              내 계정
            </span>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={closeMenu}
            aria-label="개인 메뉴 닫기"
          >
            ×
          </button>
        </div>

        {/* Menu */}
        <nav className={styles.drawerMenu}>
          <NavLink
            to="/auth/mypage"
            onClick={closeMenu}
          >
            내정보
          </NavLink>

          <NavLink
            to="/homeGroup"
            onClick={closeMenu}
          >
            학습현황
          </NavLink>

          <NavLink
            to="/homeGroup"
            onClick={closeMenu}
          >
            스터디 생성
          </NavLink>

          <NavLink
            to="/point"
            onClick={closeMenu}
          >
            포인트 구매
          </NavLink>

          {canOpenAdmin && <NavLink
            to="/admin"
            onClick={closeMenu}
          >
            관리자 메뉴
          </NavLink>}

          <NavLink
            to="/friend/list"
            onClick={closeMenu}
          >
            내 친구
          </NavLink>
        </nav>

        {/* Logout */}
        <div className={styles.drawerFooter}>
          <button
            type="button"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserMenu;
