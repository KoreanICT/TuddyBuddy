import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './authLayout.module.css';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const isMyPage = useLocation().pathname === '/auth/mypage';
    return (
        <div className={`${styles.authLayout} ${isMyPage ? styles.myPageLayout : ''}`}>

            {/* 홈 이동 로고 */}
            <Link to="/" className={styles.logo}>
                <img
                    src="/images/logo.png"
                    alt="TuddyBuddy"
                    className={styles.logoImage}
                />
            </Link>

            <main className={styles.main}>
                {children}
            </main>

        </div>
    );
};

export default AuthLayout;
