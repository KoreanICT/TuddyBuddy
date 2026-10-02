import React, { useEffect, useRef, useState } from 'react'
import styles from './chatbot.module.css'
import { Bot, Send, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

interface ChatBotProps {
    onClose: () => void;
}

interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
}


const ChatBot: React.FC<ChatBotProps> = (props) => {

    const navigate = useNavigate();
    const isLogin = false;

    // 지난 대화 유지
    const [messages, setMessages] = useState<Message[]>(() => {
        const savedMessages = sessionStorage.getItem('chatMessages');

        if (savedMessages) {
            return JSON.parse(savedMessages);
        }

        return [];
    });

    // 입력한 질문
    const [input, setInput] = useState('');

    // <div>를 가리킬 변수
    const chatEndRef = useRef<HTMLDivElement>(null);

    // input(입력)한 내용 message에 전달
    const sendMessage = () => {
        if (input.trim() === '') return;

        const newMessage: Message = {
            id: Date.now(),
            sender: 'user',
            text: input.trim()
        };

        setMessages(prev => [...prev, newMessage]);

        setInput('');
    };

    // 메시지 추가 시 맨 아래로 이동
    useEffect(() => {
        chatEndRef.current?.scrollIntoView();
    }, [messages]);


    // 메시지 sessionStorage에 저장
    useEffect(() => {
        sessionStorage.setItem(
            'chatMessages',
            JSON.stringify(messages)
        );
    }, [messages]);

    // 로그인 페이지 이동
    const moveLogin = () => {
        props.onClose();
        navigate('/auth/member');
    };

    return (
        <div className={styles.chatBot}>

            {/* 상단 - 챗봇 상담 */}
            <div className={styles.chatHeader}>
                <div>
                    <Bot size={24} />
                    <span>버디봇</span>
                </div>

                <button
                    type='button'
                    onClick={props.onClose}>
                    <X size={20} />
                </button>
            </div>

            {/* 비회원 영역 - 로그인 안내 문구 */}
            {!isLogin && (
                <div className={styles.loginNotice}>
                    <span>
                        로그인 후에 더 다양한 기능을 이용할 수 있습니다.
                    </span>

                    <button
                        type='button'
                        onClick={moveLogin}>
                        로그인
                    </button>
                </div>
            )}

            {/* 대화 - 대화 내용 */}
            <div className={styles.chatContent}>

                {/* 초기 안내 */}
                {isLogin ? (
                    <div className={styles.botMessage}>
                        안녕하세요! 버디봇입니다.
                        <br />
                        무엇을 도와드릴까요?
                    </div>
                ) : (
                    <div className={styles.botMessage}>
                        안녕하세요! 버디봇입니다.
                        <br />
                        터디버디 이용에 대해 궁금한 점을 물어보세요.
                    </div>
                )}

                {/* 실제 대화 */}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={message.sender === 'bot' ? styles.botMessage : styles.userMessage}>
                        {message.text}
                    </div>
                ))}

                {/* 대화 마지막 위치 */}
                <div ref={chatEndRef}></div>
            </div>

            {/* 입력 - 메시지 입력 */}
            <div className={styles.chatInput}>
                <input 
                    type="text" 
                    placeholder='질문을 입력해주세요.' 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                />
                <button 
                    type='button'
                    onClick={sendMessage}
                >
                    <Send size={20} />
                </button>
            </div>

        </div>
    )
}

export default ChatBot