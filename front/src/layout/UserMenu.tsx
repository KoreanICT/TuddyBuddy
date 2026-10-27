import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

import { useAppDispatch } from '../login/reducers/store';
import { logoutAction } from '../login/authActions/authActions';


import styles from './userMenu.module.css';
import AuthModal from '../login/AuthModal';
import { ROLE_ACCESS } from '../login/auth/roles';
import RoleGate from '../login/auth/RoleGate';
import { useRoleAccess } from '../login/hooks/useRoleAccess';
import { useNotification } from '../notification/NotificationProvider';
import { NotificationModal } from '../notification/NotificationModal';
import { NotificationList } from "../notification/NotificationList";
const UserMenu: React.FC = () => {

  // Redux JWT 로그인 상태
  const { isAuthenticated: isLogin } = useRoleAccess();

  const dispatch = useAppDispatch();

  const { notifications, hasNewNotification, retry } = useNotification();

  // 내 계정 사이드 메뉴
  const [isOpen, setIsOpen] = useState(false);

  // 로그인/회원가입 팝업
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [IsNotiOpen, setIsNotiOpen] = useState(false);

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
      {/* 알림 버튼 */}
      <div className={styles.userMenu}>
        <RoleGate allowedRoles={ROLE_ACCESS.member}>
          <NavLink to="/attendance" className={({ isActive }) => `${styles.profileButton} ${isActive ? styles.attendanceActive : ''}`}>
            <span className={styles.profileIcon}><CalendarCheck size={18} aria-hidden="true" /></span>
            <span>출석</span>
          </NavLink>
        </RoleGate>
        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => {
              retry();
              setIsNotiOpen(true);
            }}
            aria-label="알림 목록 열기"
          >
            <span className={styles.profileIcon}>
              {hasNewNotification ? '❗' : '🔔'}
            </span>
            <span>알림</span>
          </button>

          {IsNotiOpen && (
            <NotificationModal
              notifications={notifications}
              onClose={() => {
                retry();
                setIsNotiOpen(false)
              }}
            />
          )}
        </div>
        {/* 프로필 버튼 */}
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
        className={`${styles.overlay} ${isOpen ? styles.open : ''
          }`}
        onClick={closeMenu}
      />

      {/* Side Menu */}
      <aside
        className={`${styles.drawer} ${isOpen ? styles.open : ''
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
            마이페이지
          </NavLink>

          <NavLink
            to="/homeGroup"
            onClick={closeMenu}
          >
            학습현황
          </NavLink>

          <NavLink
            to="/group"
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

          <RoleGate allowedRoles={ROLE_ACCESS.admin}><NavLink
            to="/admin"
            onClick={closeMenu}
          >
            관리자 메뉴
          </NavLink></RoleGate>

          <NavLink
            to="/friend/list"
            onClick={closeMenu}
          >
            내 친구
          </NavLink>

          <NavLink
            to="/notification"
            onClick={closeMenu}
          >
            알림
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
