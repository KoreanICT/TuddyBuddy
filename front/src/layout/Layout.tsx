import React from 'react';
import styles from './layout.module.css'
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <div className={styles.layout}>
        <header className={styles.header}>
          <div className="container">
            {/* Header */}
            <Navbar />
          </div>
        </header>

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;