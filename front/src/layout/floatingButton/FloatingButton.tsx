import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, Plus, X, Flag, Bot } from 'lucide-react';

import styles from './floatingButton.module.css';
import ChatBot from '../../cont/chatbot/ChatBot';

const FloatingButton: React.FC = () => {

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const toggleMenu = () => {
        setOpen(prev => !prev);
    };

    // 챗봇 이동
    const openChatBot = () => {
        setChatOpen(true);
        setOpen(false);
    }

    // 마이페이지 이동
    const moveMyPage = () => {
        // TODO: 마이페이지 완성 후 경로 변경
        navigate('/auth/member');
        setOpen(false);
    };

    // 친구 추가 이동
    const moveFriendAdd = () => {
        navigate('/friend/add');
        setOpen(false);
    };

    const moveReportCreate = () => {
        navigate('/reportCreate');
        setOpen(false);
    };

    return (
        <div className={styles.floatingWrapper}>

            {/* 펼쳐지는 메뉴 */}
            {open && (
                <div className={styles.floatingMenu}>

                    {/* 챗봇 */}
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={openChatBot}
                    >
                        <span className={styles.menuIcon}>
                            <Bot size={22} />
                        </span>

                        <span>
                            버디봇
                        </span>
                    </button>

                    {/* 마이페이지 */}
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={moveMyPage}
                    >
                        <span className={styles.menuIcon}>
                            <User />
                        </span>

                        <span>
                            마이페이지
                        </span>
                    </button>

                    {/* 친구 추가 */}
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={moveFriendAdd}
                    >
                        <span className={styles.menuIcon}>
                            <UserPlus />
                        </span>

                        <span>
                            친구 추가
                        </span>
                    </button>
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={moveReportCreate}
                    >
                        <span className={styles.menuIcon}>
                            <Flag size={18} />
                        </span>

                        <span>
                            신고하기
                        </span>
                    </button>

                </div>
            )}

            {/* 챗봇 */}
            {chatOpen && (
                <ChatBot 
                    onClose={() => setChatOpen(false)}/>
            )}

            {/* 메인 플로팅 버튼 */}
            <button
                type="button"
                className={`${styles.floatingButton} ${open ? styles.open : ''
                    }`}
                onClick={toggleMenu}
                aria-label={
                    open
                        ? '플로팅 메뉴 닫기'
                        : '플로팅 메뉴 열기'
                }
            >
                {open
                    ? <X />
                    : <Plus />
                }
            </button>

        </div>
    );
};

export default FloatingButton;