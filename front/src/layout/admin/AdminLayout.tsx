import React from 'react';
import styles from './adminLayout.module.css';
import AdminSidebar from './AdminSidebar';
import { Link } from 'react-router-dom';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className={styles.adminLayout}>

            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.logo}>
                        관리자 페이지
                    </div>

                    <div className={styles.userMenu}>
                        <Link to="/" className={styles.homeLink}>
                            홈페이지
                        </Link>

                        <span className={styles.divider}>|</span>

                        <span>관리자</span>
                    </div>
                </div>
            </header>

            <div className={styles.body}>

                <AdminSidebar />

                <main className={styles.main}>
                    {children}
                </main>

            </div>

        </div>
    );
};

export default AdminLayout;