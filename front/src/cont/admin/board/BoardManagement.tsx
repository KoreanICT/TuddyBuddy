import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './boardManagement.module.css';

const BoardManagement: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div className={styles.board}>

            {/* =========================
                Header
            ========================= */}

            <div className={styles.header}>
                <div>
                    <h1>게시판 관리</h1>
                    <p>
                        게시판의 게시글을 관리할 수 있습니다.
                    </p>
                </div>
            </div>


            {/* =========================
                Board Menu
            ========================= */}

            <div className={styles.menu}>

                <button
                    className={styles.menuItem}
                    onClick={() => navigate('/admin/board/list')}
                >
                    <div className={styles.menuTitle}>
                        전체 게시글 조회
                    </div>

                    <div className={styles.menuDescription}>
                        커뮤니티 및 공지사항의 모든 게시글을 조회하고 관리합니다.
                    </div>
                </button>

            </div>

        </div>
    );
};

export default BoardManagement;