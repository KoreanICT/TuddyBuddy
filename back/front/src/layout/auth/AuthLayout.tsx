import React from 'react';
import { Link } from 'react-router-dom';
import styles from './authLayout.module.css';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className={styles.authLayout}>

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