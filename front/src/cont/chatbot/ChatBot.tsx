import { authenticatedFetch } from '../../login/authHttp';
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

// 현재 대화의 요청 상태
interface ChatRequestState {
    // 이전 대화가 되어 응답을 무시해야 하는지
    cancelled: boolean;
}


// Spring Boot 요청에 사용할 인증 해더
// 함수는 유지하고 요청할 때 최신 토큰 사용
const getAuthHeaders = (token: string | null | undefined) => {
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

// 세션 번호별로 진행 중인 답변 요청 보관
// 컴포넌트 밖에 있으므로 x로 닫아도 유지됨
const pendingChatRequests: {
    [chatNum: number]: Promise<void> | undefined;
} = {};

const ChatBot: React.FC<ChatBotProps> = (props) => {

    const navigate = useNavigate();

    // Redux에서 로그인 정보 가져오기
    const { token, member_num } = useSelector(
        (state: RootState) => state.auth
    );

    // Redux 상태로 로그인 여부 판단
    // null과 undefined 모두 제외
    const isLogin = Boolean(token && member_num != null);

    // 최신 인증 토큰 보관
    const tokenRef = useRef(token);

    // 토큰이 바뀌면 저장된 토큰 갱신
    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

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

    // 비회원 대화 접근 정보 확인 실패
    const [guestAccessError, setGuestAccessError] = useState(false);

    // 대화 내역 재조회 요청 횟수
    const [historyRetry, setHistoryRetry] = useState(0);

    // 입력한 질문
    const [input, setInput] = useState('');

    // AI 답변 대기 상태
    const [isLoading, setIsLoading] = useState(false);

    // 현재 대화의 요청 상태 보관
    const chatRequestRef = useRef<ChatRequestState | null>(null);

    // 상태 업데이트 전에도 중복 전송 방지
    const sendingRef = useRef(false);

    // 대화 마지막 위치
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 임시 메시지 ID 관리
    const messageIdRef = useRef(0);

    // 임시 메시지 ID 생성 함수
    const getMessageId = () => {
        messageIdRef.current += 1;
        return `temp-${messageIdRef.current}`;
    };

    // 로그인 상태에 맞는 세션 준비 및 대화 복원
    useEffect(() => {
        // 이 대화의 응답을 무시해야 하는지 표시
        const requestState: ChatRequestState = {
            cancelled: false
        };

        chatRequestRef.current = requestState;

        // 세션 준비시 사용할 토큰만 보관
        // 토큰만 갱신될 때 이 effect를 다시 실행하지 않도록 처리
        const currentToken = tokenRef.current;

        // 이전 사용자의 화면 상태 초기화
        setActiveChatKey(null);
        setChatNum(null);
        setMessages([]);
        setInput('');
        setIsLoading(false);
        setIsHistoryLoaded(false);
        setSessionError(false);
        setHistoryError(false);
        setGuestAccessError(false);
        sendingRef.current = false;

        // 세션 준비 이후 발생한 오류는 대화 조회 오류로 구분
        let sessionReady = false;

        const prepareChat = async () => {
            try {
                // 비회원도 현재 탬에 저장된 세션 번호 확인
                const savedChatNum = sessionStorage.getItem(chatStorageKey);
                let nextChatNum = savedChatNum ? Number(savedChatNum) : null;

                // 올바르지 않은 저장값은 사용하지 않음
                if (nextChatNum !== null && (!Number.isSafeInteger(nextChatNum) || nextChatNum <= 0)) {
                    sessionStorage.removeItem(chatStorageKey);
                    nextChatNum = null;
                }

                // 기존에 저장된 세션을 복원하는 중인지 확인
                const isStoredSession = nextChatNum !== null;

                // 현재 사용자의 저장된 세션이 없으면 생성
                if (nextChatNum === null) {
                    const response = await authenticatedFetch(
                        'http://localhost:80/back/api/chatbot/session',
                        {
                            method: 'POST',
                            headers: getAuthHeaders(isLogin ? currentToken : null),
                            credentials: 'include',
                            body: JSON.stringify({
                                // 실제 회원 번호는 서버에서 JWT로 결정
                                member_num: null
                            })
                        }
                    );

                    // 이전 대화가 됐다면 응답 무시
                    if (requestState.cancelled) return;

                    if (!response.ok) {
                        throw new Error('채팅 세션 생성 실패');
                    }

                    const data = await response.json();

                    if (requestState.cancelled) return;

                    const createdChatNum = Number(data.chat_num);

                    if (!Number.isSafeInteger(createdChatNum) || createdChatNum <= 0) {
                        throw new Error('잘못된 채팅 세션 번호');
                    }

                    nextChatNum = createdChatNum;

                    // 회원과 비회원 모두 세션 번호 저장
                    sessionStorage.setItem(chatStorageKey, String(nextChatNum));
                }

                if (requestState.cancelled) return;

                sessionReady = true;
                setChatNum(nextChatNum);

                // 닫기 전에 시작한 답변 요청이 있는지 확인
                const pendingRequest = pendingChatRequests[nextChatNum];

                if (pendingRequest) {
                    // 다시 연 화면에 답변 생성 중 안내 표시
                    // isHistoryLoaded는 아직 false여서 질문 입력은 차단됩
                    setActiveChatKey(chatStorageKey);
                    setIsLoading(true);

                    // 이전 요청이 끝날 때까지 기다림
                    await pendingRequest;

                    // 기다리는 동안 로그아웃하거나 창을 닫았다면 중단
                    if (requestState.cancelled) return;

                    setIsLoading(false);
                }

                // 현재 사용자의 기존 대화 조회
                // X로 닫앗다 다시 열면 같은 세션의 기록 복원
                const response = await authenticatedFetch(
                    `http://localhost:80/back/api/chatbot/message/session/${nextChatNum}`,
                    {
                        headers: getAuthHeaders(isLogin ? currentToken : null),
                        credentials: 'include'
                    }
                );

                // 계정 전환 또는 창 닫기로 취소된 조회 결과는 반영하지 않음
                if (requestState.cancelled) return;

                // 비회원 대화에 접근할 수 없는 경우
                if (
                    response.status === 403 &&
                    chatStorageKey === 'guestChatNum'
                ) {
                    setGuestAccessError(true);
                    return;
                }

                // 저장된 세션이 삭제된 경우 새 세션 준비
                if (response.status === 404 && isStoredSession) {
                    sessionStorage.removeItem(chatStorageKey);

                    // 기존 세션 준비 effect를 다시 실행
                    // 저장된 번호가 없으므로 새 세션 생성으로 진행
                    setSessionRetry(prev => prev + 1);
                    return;
                }

                if (!response.ok) {
                    throw new Error('대화 내역 조회 실패');
                }

                const data: ChatMessageResponse[] = await response.json();

                // 계정 전환 또는 창 닫기로 취소된 조회 결과는 반영하지 않음
                if (requestState.cancelled) return;

                // DB 데이터 -> React 메시지 형식으로 변환
                const loadedMessages: Message[] = data.map(
                    (message) => ({
                        id: message.message_num,
                        sender: message.message_sender,
                        text: message.message_content
                    })
                );

                setMessages(loadedMessages);

                // 대화 조회까지 완료된 세션만 사용 가능
                setActiveChatKey(chatStorageKey);
                setIsHistoryLoaded(true);
            } catch (error) {
                // 계정 전환 또는 창 닫기로 취소된 요청은 무시
                if (requestState.cancelled) return;

                console.error('채팅 준비 오류: ');

                if (sessionReady) {
                    setHistoryError(true);
                } else {
                    setSessionError(true);
                }
            }
        };

        prepareChat();

        return () => {
            // 이전 대화의 응답을 무시하도록 표시 -> 서버 요청 자체를 중단하는 것은 아님
            requestState.cancelled = true;

            if (chatRequestRef.current === requestState) {
                chatRequestRef.current = null;
            }
        };
        // getAuthHeaders는 컴포넌트 밖에 있으므로 랜더링할 때마다 새로 만들어지지 않음
    }, [chatStorageKey, isLogin, sessionRetry, historyRetry]);

    // 채팅 세션 생성 다시 시도
    const retryCreateSession = () => {
        setSessionRetry(prev => prev + 1);
    };

    // 기존 대화 내역 다시 조회
    const retryLoadMessages = () => {
        setHistoryRetry(prev => prev + 1);
    };

    // 비회원 새 대화 시작
    const StartNewGuestChat = () => {
        // 회원 상태에서는 실행하지 않음
        if (isLogin || !guestAccessError) return;

        // 이 탭에 저장된 비회원 세션번호만 제거
        sessionStorage.removeItem('guestChatNum');

        // 화면 상태 초기화
        setGuestAccessError(false);
        setChatNum(null);
        setActiveChatKey(null);
        setMessages([]);
        setInput('');
        setIsHistoryLoaded(false);

        // 기존 세션 준비 effect 실행
        // 저장된 번호가 없으므로 새 세션 생성
        setSessionRetry(prev => prev + 1);
    }

    // 사용자 질문 정송 및 AI 답변 받기
    const sendMessage = async () => {
        const requestState = chatRequestRef.current;

        // 현재 사용자 세션이 준비된 경우에만 전송
        if (
            input.trim() === '' || chatNum === null || !isCurrentChat ||
            !isHistoryLoaded || isLoading || sendingRef.current ||
            !requestState || requestState.cancelled
        ) { return; }

        if (input.length > 1000) {
            window.alert('질문은 1,000자 이하로 입력해 주세요.');
            return;
        }
        const question = input.trim();
        const messageId = getMessageId();

        // 중복 전송 방지를 위해 로딩 상태 변경
        sendingRef.current = true;
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

        // 추가 요청이 끝났음을 알려줄 함수
        let finishRequest: () => void = () => { };

        // 이 Promise는 아래 finally에서 완료 처리
        const pendingRequest = new Promise<void>((resolve) => {
            finishRequest = resolve;
        });

        // 현재 세션에서 답변을 기다리고 있음을 기록
        pendingChatRequests[chatNum] = pendingRequest;

        // 기본 오류 안내
        let errorMessage = '서버 응답을 받지 못했습니다. 잠시 후 대화 내역을 다시 확인해 주세요.';

        try {
            // Spring Boot에 AI 질문 요청
            const response = await authenticatedFetch(
                'http://localhost:80/back/api/chatbot/ai',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: getAuthHeaders(tokenRef.current),
                    body: JSON.stringify({
                        chat_num: chatNum,
                        question,
                        user_type: isLogin ? 'MEMBER' : 'GUEST'
                    })
                }
            );

            // 이전 대화의 요청이면 화면을 변경하지 않음
            if (requestState.cancelled) return;

            // 창을 열어둔 동안 비회원 소유 정보가 만료된 경우
            if (response.status === 403 && !isLogin) {
                setGuestAccessError(true);

                // 기존 대화의 추가 전송 차단
                setIsHistoryLoaded(false);
                return;
            }
            if (!response.ok) {
                // AI 서버 장애 안내는 문자열 응답으로 전달됨
                if (response.status === 503) {
                    const serverMessage = await response.text();

                    errorMessage = serverMessage.trim() ||
                        '현재 AI 서버를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.'
                } else if (response.status === 400) {
                    // 질문 유효성 검증 오류 안내
                    const serverMessage = await response.text();

                    errorMessage = serverMessage.trim() ||
                        '질문 내용을 확인해 주세요.';
                }
                throw new Error('AI 답변 요청 실패');
            }

            // Spring Boot에서 반환한 AI 응답
            const data = await response.json();

            // 화면 반영만 차단
            if (requestState.cancelled) return;

            // 답변이 없거나 공백뿐이면 오류 처리
            if (
                typeof data?.answer !== 'string' ||
                data.answer.trim() === ''
            ) {
                throw new Error('AI 답변 내용이 없습니다.');
            }

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
                    text: data.answer,
                }
            ]);
        } catch (error) {
            // 계정 전환 또는 창 닫기로 취소된 요청은 무시
            if (requestState.cancelled) return;
            console.error('챗봇 오류: ');

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
                    text: errorMessage
                }
            ]);

        } finally {
            // 성공/실패/창 닫기 여부와 관계없이 요청 완료 알림
            finishRequest();

            // 현재 요청의 기록만 정리
            if (pendingChatRequests[chatNum] === pendingRequest) {
                delete pendingChatRequests[chatNum];
            }

            // 이전 요청이 새 세션의 로딩 상태를 변경하지 않도록 방지
            if (!requestState.cancelled) {
                sendingRef.current = false;
                setIsLoading(false);
            }
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
                {/* 비회원 대화 접근 정보 확인 실패 */}
                {!isLogin && guestAccessError && (
                    <div className={styles.historyError}>
                        <p>대화 접근 정보를 확인할 수 없습니다.</p>
                        <span>
                            확인 정보가 만료되었거나 접근할 수 없는 대화입니다.
                            새 대화를 시작해 주세요.
                            이전 대화는 이 화면에 복원되지 않습니다.
                        </span>
                        <button
                            type='button'
                            onClick={StartNewGuestChat}
                        >
                            새 대화 시작
                        </button>
                    </div>
                )}
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
                {isCurrentChat && isHistoryLoaded && messages.length === 0 && (
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
                    </>
                )}


                {/* 실제 대화 */}
                {isCurrentChat && isHistoryLoaded && messages.map((message) => (
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
                {isCurrentChat && isLoading && (
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
                    maxLength={1000}
                    placeholder='질문을 입력해주세요.'
                    value={isCurrentChat ? input : ''}
                    disabled={!isCurrentChat || !isHistoryLoaded}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        // 한글을 조합 중이면 전송하지 않음
                        if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) { return };

                        if (e.key === 'Enter') {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <button
                    type='button'
                    onClick={sendMessage}
                    disabled={!isCurrentChat || isLoading || chatNum === null || !isHistoryLoaded}
                >
                    <Send size={20} />
                </button>
            </div>

            {/* 입력 길이 안내 */}
            <div
                style={{ padding: '0 12px 8px', fontSize: '12px' }}
            >
                {isCurrentChat ? input.length : 0} / 1,000자
            </div>
        </div>
    );
};

export default ChatBot