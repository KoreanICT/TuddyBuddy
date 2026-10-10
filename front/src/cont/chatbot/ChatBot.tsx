import React, { useEffect, useRef, useState } from 'react'
import styles from './chatbot.module.css'
import { Bot, LoaderCircle, Send, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

interface ChatBotProps {
    onClose: () => void;
}

interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
}

interface ChatMessageResponse {
    message_num: number;
    chat_num: number;
    message_sender: 'user' | 'bot';
    message_content: string;
    message_regdate: string;
}



const ChatBot: React.FC<ChatBotProps> = (props) => {

    const navigate = useNavigate();
    const isLogin = false;

    // 현재 채팅 세션 번호
    const [chatNum, setChatNum] = useState<number | null>(null);

    // 대화 메시지
    const [messages, setMessages] = useState<Message[]>([]);

    // 채팅 세션 생성 및 유지
    useEffect(() => {
        // sessionStorage 사용 이유 => 기존 세션 번호 확인
        const savedChatNum = sessionStorage.getItem('chatNum');
        if (savedChatNum) {
            setChatNum(Number(savedChatNum));
            return;
        }

        // 새로운 채팅 세션 생성
        const createSession = async () => {
            try {
                const response = await fetch(
                    'http://192.168.0.114:80/back/api/chatbot/session',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            // 비회원 테스트용
                            member_num: null
                        })
                    }
                );
                if (!response.ok) {
                    throw new Error('채팅 세션 생성 실패');
                }
                const data = await response.json();

                // 발급받은 세션 번호 저장
                setChatNum(data.chat_num);
                sessionStorage.setItem('chatNum', String(data.chat_num));
            } catch (error) {
                console.error('채팅 세션 생성 오류: ', error);
            }
        };
        createSession();
    }, []);

    // DB에서 기존 대화 내역 조회
    useEffect(() => {
        // 세션 번호가 없으면 조회하지 않음
        if (chatNum === null) return;

        const loadMessages = async () => {
            try {
                const response = await fetch(
                    `http://192.168.0.114:80/back/api/chatbot/message/session/${chatNum}`
                );

                if (!response.ok) {
                    throw new Error('대화 내역 조회 실패');
                }

                const data: ChatMessageResponse[] = await response.json();

                // DB 데이터 -> React 메시지 형식으로 변환
                const loadedMessages: Message[] = data.map((message) => ({
                    id: message.message_num,
                    sender: message.message_sender,
                    text: message.message_content
                }));

                // 조회한 대화 내역을 화면에 표시
                setMessages(loadedMessages);
            } catch (error) {
                console.error('대화 내역 조회 오류: ', error);
            }
        };
        loadMessages();
    }, [chatNum])

    // 입력한 질문
    const [input, setInput] = useState('');

    // AI 다변 대기 상태
    const [isLoading, setIsLoading] = useState(false);

    // <div>를 가리킬 변수
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 사용자 질문 정송 및 AI 답변 받기
    const sendMessage = async () => {
        // 질문이 비어 있거나 세션 번호가 없으면 전송하지 않음
        if (input.trim() === '' || chatNum ===null || isLoading) return;

        const question = input.trim();

        const newMessage: Message = {
            id: Date.now(),
            sender: 'user',
            text: question
        };

        // 중복 전송 방지를 위해 로딩 상태 변경
        setIsLoading(true);

        // 사용자 질문 화면에 표시
        setMessages(prev => [...prev, newMessage]);
        setInput('');

        try {
            // Spring Boot에 AI 질문 요청
            const response = await fetch(
                'http://192.168.0.114:80/back/api/chatbot/ai',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_num: chatNum,
                        question: question,
                        user_type: isLogin ? 'MEMBER' : 'GUEST'
                    })
                }
            );
            if (!response.ok) {
                throw new Error('AI 답변 요청 실패');
            }

            // Spring Boot에서 반환한 AI 응답
            const data = await response.json();
            const botMessage: Message = {
                id: Date.now() + 1,
                sender: 'bot',
                text: data.answer // AI 답변 채팅창에 표시
            };

            // AI 답변 화면에 표시
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('챗봇 오류: ', error);

            // 오류 발생 시 사용자에게 안내 메시지 표시
            const errorMessage: Message = {
                id: Date.now() + 2,
                sender: 'bot',
                text: '죄송합니다. 현재 답변을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            // 성공하거나 오류가 발생해도 다시 질문할 수 있도록 변경
            setIsLoading(false);
        }
    };

    // 메시지 추가 또는 AI 답변 대기 상태 변경 시 맨 아래로 이동
    useEffect(() => {
        chatEndRef.current?.scrollIntoView();
    }, [messages, isLoading]);

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
                        사이트 이용 중 궁금한 점이나 문제점을 물어보세요.
                    </div>
                ) : (
                    <div className={styles.botMessage}>
                        안녕하세요! 버디봇입니다.
                        <br />
                        터디버디 기본 이용 방법에 대해 물어보세요.
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

                {/* AI 답변 대기 메시지 */}
                {isLoading && (
                    <div className={`{styles.botMessage} ${styles.loadedMessages}`}>
                        <LoaderCircle size={16} className={styles.loadingIcon} />
                        <span> 버디봇이 답변을 생성하고 있습니다...</span>
                    </div>
                )}

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
                    disabled={isLoading || chatNum === null}
                >
                    <Send size={20} />
                </button>
            </div>

        </div>
    )
}

export default ChatBot