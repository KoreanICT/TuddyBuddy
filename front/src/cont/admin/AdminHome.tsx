import React from "react";
import styles from "./adminHome.module.css";

const AdminHome: React.FC = () => {
    return (
        <div className={styles.adminHome}>

            <div className={styles.header}>
                <h1>대시보드</h1>
                <p>관리자 페이지 현황을 확인할 수 있습니다.</p>
            </div>

            <section className={styles.summary}>
                <div className={styles.card}>
                    <span className={styles.label}>전체 회원</span>
                    <strong className={styles.value}>0</strong>
                </div>

                <div className={styles.card}>
                    <span className={styles.label}>전체 게시글</span>
                    <strong className={styles.value}>0</strong>
                </div>

                <div className={styles.card}>
                    <span className={styles.label}>신고 접수</span>
                    <strong className={styles.value}>0</strong>
                </div>

                <div className={styles.card}>
                    <span className={styles.label}>오늘 가입자</span>
                    <strong className={styles.value}>0</strong>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.panel}>
                    <h2>최근 가입 회원</h2>
                    <div className={styles.empty}>
                        최근 가입 회원이 없습니다.
                    </div>
                </div>

                <div className={styles.panel}>
                    <h2>최근 게시글</h2>
                    <div className={styles.empty}>
                        최근 게시글이 없습니다.
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AdminHome;