// 허승표

import React, { useEffect, useRef, useState } from 'react'
import styles from './chatbot.module.css'
import { Bot, LoaderCircle, Send, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSelector } from 'react-redux';
import { RootState } from '../../login/reducers';

interface ChatBotProps {
    onClose: () => void;
}

interface Message {
    // DB 메시지는 숫자, 임시 메시지는 문자열
    id: number | string;
    sender: 'user' | 'bot';
    text: string;
    // 상태: 서버 응답 대기중 | 서버 정상 응답 | 서버 정상 처리 여부 미확인
    status?: 'sending' | 'sent' | 'failed';
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

    // Redux에서 로그인 정보 가져오기
    const { token, member_num } = useSelector(
        (state: RootState) => state.auth
    );

    // Redux 상태로 로그인 여부 판단
    const isLogin = Boolean(token && member_num !== null);

    // Spring Boot 요청에 사용할 인증 해더
    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    // 회원/비회원별 채팅 세션 저장 키
    const chatStorageKey = isLogin && member_num != null
        ? `memberChatNum_${member_num}`
        : 'guestChatNum';

    // 비회원 대표 질문
    const guestQuestions = [
        '회원가입은 어떻게 하나요?',
        '이메일 인증은 반드시 해야 하나요?',
        '어떤 방법으로 로그인할 수 있나요?'
    ];

    // 회원 대표 질문
    const memberQuestions = [
        '스터디룸은 어떻게 생성하나요?',
        '학습 이미지를 업로드해서 AI 문제를 생성하려면 어떻게 하나요?',
        '셀프스터디에서 문제를 푼 후 채점 결과는 어떻게 확인하나요?'
    ];

    // 로그인 여부에 따라 대표 질문 구분
    const exampleQuestions = isLogin ? memberQuestions : guestQuestions;

    // 현재 채팅 세션 번호
    const [chatNum, setChatNum] = useState<number | null>(null);

    // 현재 화면에 연결된 채팅 세션의 저장 키
    const [activeChatKey, setActiveChatKey] = useState<string | null>(null);

    // 현재 로그인 상태에 맞는 세션인지 확인
    const isCurrentChat = activeChatKey === chatStorageKey;

    // 채팅 세션 생성 실패 여부
    const [sessionError, setSessionError] = useState(false);

    // 채팅 세션 생성 재시도 횟수
    const [sessionRetry, setSessionRetry] = useState(0);

    // 대화 메시지
    const [messages, setMessages] = useState<Message[]>([]);

    // 기존 대화 내역 조회 완료 여부
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

    // 대화 내역 조회 실패 여부
    const [historyError, setHistoryError] = useState(false);

    // 대화 내역 재조회 요청 횟수
    const [historyRetry, setHistoryRetry] = useState(0);

    // 채팅 세션 생성 및 유지
    useEffect(() => {
        let cancelled = false;

        // sessionStorage 사용 이유 => 기존 세션 번호 확인
        const savedChatNum = sessionStorage.getItem(chatStorageKey);
        if (savedChatNum) {
            setChatNum(Number(savedChatNum));
            return;
        }

        // 새로운 채팅 세션 생성
        const createSession = async () => {
            setSessionError(false);

            try {
                const response = await fetch(
                    'http://localhost:80/back/api/chatbot/session',
                    {
                        method: 'POST',
                        headers: getAuthHeaders(),
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

                if (!cancelled) {
                    // 발급받은 세션 번호 저장
                    setChatNum(data.chat_num);
                    sessionStorage.setItem(chatStorageKey, String(data.chat_num));
                }

            } catch (error) {
                if (!cancelled) {
                    console.error('채팅 세션 생성 오류: ', error);
                    setSessionError(true);
                }
            }
        };
        createSession();

        return () => {
            cancelled = true;
        };
    }, [sessionRetry]);

    // 채팅 세션 생성 다시 시도
    const retryCreateSession = () => {
        setSessionRetry(prev => prev + 1);
    };

    // DB에서 기존 대화 내역 조회
    useEffect(() => {
        // 세션 번호가 없으면 조회하지 않음
        if (chatNum === null) return;

        let cancelled = false;

        const loadMessages = async () => {
            // 대화 조회 시작
            setIsHistoryLoaded(false);
            setHistoryError(false);

            try {
                const response = await fetch(
                    `http://localhost:80/back/api/chatbot/message/session/${chatNum}`,
                    {
                        headers: getAuthHeaders(),
                    }
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

                if (!cancelled) {
                    // 조회한 대화 내역을 화면에 표시
                    setMessages(loadedMessages);
                    setIsHistoryLoaded(true);
                }

            } catch (error) {
                if (!cancelled) {
                    console.error('대화 내역 조회 오류: ', error);
                    setHistoryError(true);
                }
            }
        };
        loadMessages();

        return () => {
            cancelled = true;
        }
    }, [chatNum, historyRetry])

    // 기존 대화 내역 다시 조회
    const retryLoadMessages = () => {
        setHistoryRetry(prev => prev + 1);
    };

    // 입력한 질문
    const [input, setInput] = useState('');

    // AI 답변 대기 상태
    const [isLoading, setIsLoading] = useState(false);

    // <div>를 가리킬 변수
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 임시 메시지 ID 관리
    const messageIdRef = useRef(0);

    // 임시 메시지 ID 생성 함수
    const getMessageId = () => {
        messageIdRef.current += 1;
        return `temp-${messageIdRef.current}`;
    };

    // 사용자 질문 정송 및 AI 답변 받기
    const sendMessage = async () => {
        // 질문이 비어 있거나 세션 번호가 없으면 전송하지 않음
        if (input.trim() === '' || chatNum === null || !isHistoryLoaded || isLoading) {
            return;
        }

        const question = input.trim();
        const messageId = getMessageId();

        // 중복 전송 방지를 위해 로딩 상태 변경
        setIsLoading(true);

        // 사용자 메시지 추가 (전송 중)
        setMessages(prev => [
            ...prev,
            {
                id: messageId,
                sender: 'user',
                text: question,
                status: 'sending'
            }
        ]);

        setInput('');

        try {
            // Spring Boot에 AI 질문 요청
            const response = await fetch(
                'http://localhost:80/back/api/chatbot/ai',
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        chat_num: chatNum,
                        question,
                        user_type: isLogin ? 'MEMBER' : 'GUEST'
                    })
                }
            );
            if (!response.ok) {
                throw new Error('AI 답변 요청 실패');
            }

            // Spring Boot에서 반환한 AI 응답
            const data = await response.json();

            // 정상 응답 확인 후 전송 상태 변경
            setMessages(prev =>
                prev.map(message =>
                    message.id === messageId
                        ? { ...message, status: 'sent' }
                        : message
                )
            );

            // AI 답변 추가
            setMessages(prev => [
                ...prev,
                {
                    id: getMessageId(),
                    sender: 'bot',
                    text: data.answer
                }
            ]);

        } catch (error) {
            console.error('챗봇 오류: ', error);

            // 서버 처리 여부를 확인할 수 없는 상태
            setMessages(prev =>
                prev.map(message =>
                    message.id === messageId
                        ? { ...message, status: 'failed' }
                        : message
                )
            );

            // 오류 안내 추가
            setMessages(prev => [
                ...prev,
                {
                    id: getMessageId(),
                    sender: 'bot',
                    text: '서버 응답을 받지 못했습니다. 잠시 후 대화 내역을 다시 확인해 주세요.'
                }
            ]);

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
                {/* 채팅 세션 생성 실패 안내 */}
                {sessionError && chatNum === null && (
                    <div className={styles.historyError}>
                        <p>채팅을 시작하지 못했습니다.</p>
                        <span>서버 연결 상태를 확인한 후 다시 시도해 주세요.</span>
                        <button
                            type='button'
                            onClick={retryCreateSession}
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* 대화 내역 조회 실패 안내 */}
                {historyError && (
                    <div className={styles.historyError}>
                        <p>대화 내역을 불러오지 못했습니다.</p>
                        <span>서버 연결 상태를 확인한 후 다시 시도해 주세요.</span>
                        <button
                            type='button'
                            onClick={retryLoadMessages}
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* 초기 안내 및 대표 질문 */}
                {isHistoryLoaded && messages.length === 0 && (
                    <>
                        <div className={styles.botMessage}>
                            안녕하세요! 버디봇입니다.
                            <br />
                            {isLogin
                                ? '사이트 이용 중 궁금한 점이나 문제점을 물어보세요.'
                                : '회원가입 및 로그인 등 기본 이용 방법을 안내해 드릴게요.'
                            }
                        </div>

                        {/* 초기 질문 예시 */}
                        {messages.length === 0 && (
                            <div className={styles.exampleQuestions}>
                                <p>이런 질문을 해보세요.</p>

                                {exampleQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        type='button'
                                        onClick={() => setInput(question)}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}


                {/* 실제 대화 */}
                {isHistoryLoaded && messages.map((message) => (
                    <div
                        key={message.id}
                        className={
                            message.sender === 'bot'
                                ? styles.botMessage
                                : styles.userMessage
                        }
                    >
                        {/* 봇 메시지만 Markdown 적용 */}
                        {message.sender === 'bot' ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.text}
                            </ReactMarkdown>
                        ) : (
                            message.text
                        )}

                        {message.sender === 'user' && message.status === 'sending' && (
                            <div className={styles.messageStatus}>
                                전송 중...
                            </div>
                        )}

                        {message.sender === 'user' && message.status === 'failed' && (
                            <div className={styles.messageStatusError}>
                                전송 결과를 확인하지 못했습니다.
                            </div>
                        )}
                    </div>
                ))}

                {/* AI 답변 대기 메시지 */}
                {isLoading && (
                    <div className={`${styles.botMessage} ${styles.loadingMessage}`}>
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
                    disabled={isLoading || chatNum === null || !isHistoryLoaded}
                >
                    <Send size={20} />
                </button>
            </div>

        </div>
    )
}

export default ChatBot