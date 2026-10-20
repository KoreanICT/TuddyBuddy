import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, Plus, X, Flag, Bot } from 'lucide-react';

import styles from './floatingButton.module.css';
import ChatBot from '../../cont/chatbot/ChatBot';
import RoleGate from '../../login/auth/RoleGate';
import { ROLE_ACCESS } from '../../login/auth/roles';
import ReportButton from '../../cont/report/ReportButton';

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
        navigate('/auth/mypage');
        setOpen(false);
    };

    // 친구 추가 이동
    const moveFriendAdd = () => {
        navigate('/friend/add');
        setOpen(false);
    };

    return (
        <div className={styles.floatingWrapper}>

            {/* 펼쳐지는 메뉴 */}
            <RoleGate allowedRoles={ROLE_ACCESS.member}>
            {open && (
                <div className={styles.floatingMenu}>

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
                    <ReportButton
                        type="report" targetNum={0}
                        className={styles.menuButton}
                        onClick={() => setOpen(false)}
                    >
                        <span className={styles.menuIcon}>
                            <Flag size={18} />
                        </span>

                        <span>
                            신고하기
                        </span>
                    </ReportButton>

                </div>
            )}
            </RoleGate>

            {/* 챗봇 */}
            {chatOpen && (
                <ChatBot
                    onClose={() => setChatOpen(false)} />
            )}

            {/* 비회원도 사용할 수 있는 독립 챗봇 버튼 */}
            <button
                type="button"
                className={`${styles.floatingButton} ${styles.chatButton}`}
                onClick={openChatBot}
                aria-label="버디봇 열기"
                aria-haspopup="dialog"
                aria-expanded={chatOpen}
                title="버디봇"
            >
                <Bot />
            </button>

            {/* 회원 전용 메뉴는 챗봇 바로 아래에 표시합니다. */}
            <RoleGate allowedRoles={ROLE_ACCESS.member}>
            <button
                type="button"
                className={`${styles.floatingButton} ${open ? styles.open : ''
                    }`}
                onClick={toggleMenu}
                aria-expanded={open}
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
            </RoleGate>

        </div>
    );
};

export default FloatingButton;
