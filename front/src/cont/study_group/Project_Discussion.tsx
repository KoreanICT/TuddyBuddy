// front/src/cont/study_group/Project_Discussion.tsx

import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';

import styles from './project.module.css';
import { GetGroupNum } from './GroupAPI';
import api from './api';
import store from '../../login/reducers/store';

interface ChatMessage {
    chat_num: number;
    group_num: number;
    member_num: number | null;
    member_nick: string;
    state: number;
    value: string;
    created_at: string;
}

interface ChatMember {
    memberNum: number;
    memberNick: string;
}

interface ChatClient {
    connected: boolean;

    publish(parameters: {
        destination: string;
        body: string;
    }): void;

    deactivate(): Promise<void>;
}

const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] => {
    const map = new Map<number, ChatMessage>();
    [...current, ...incoming].forEach(chat => { map.set(chat.chat_num, chat); });

    return Array.from(map.values()).sort((a, b) => a.chat_num - b.chat_num);
};
export const Project_Discussion: React.FC<GetGroupNum> = ({ groupNum }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState('');
    const [member, setMember] = useState<ChatMember | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');

    const clientRef = useRef<ChatClient | null>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let disposed = false;
        let client: ChatClient | null = null;

        setMessages([]);
        setMessage('');
        setMember(null);
        setConnected(false);
        setError('');

        const loadHistory = async () => {
            try {
                const response = await api.get<ChatMessage[]>(
                    `/groupchat/history/${groupNum}`
                );

                if (disposed) return;

                // setMessages(response.data)로 덮어쓰지 않습니다.
                // 조회 도중 도착한 실시간 메시지도 유지합니다.
                setMessages(previous =>
                    mergeMessages(previous, response.data)
                );
            } catch (error) {
                if (!disposed) {
                    setError('이전 대화를 불러오지 못했습니다.');
                    console.error(error);
                }
            }
        };

        const connect = async () => {
            try {
                const response = await api.get<ChatMember>(
                    '/groupchat/getMemberNick'
                );

                const { Client } = await import('@stomp/stompjs');

                if (disposed) return;

                setMember(response.data);

                // 환경설정 기반 API 주소에서 같은 서버의 WebSocket 경로를 구합니다.
                const baseURL = api.defaults.baseURL;
                if (!baseURL) {
                    throw new Error('서버 주소가 없습니다.');
                }

                const wsURL = `${baseURL.replace(/\/api\/?$/, '')}/ws`;

                const stomp = new Client({
                    webSocketFactory: () => new SockJS(wsURL),
                    reconnectDelay: 5000,

                    beforeConnect: () => {
                        // 재연결 때도 최신 토큰을 사용합니다.
                        const token = store.getState().auth.token;
                        stomp.connectHeaders = token
                            ? { Authorization: `Bearer ${token}` }
                            : {};
                    },

                    onConnect: () => {
                        if (disposed) return;

                        setConnected(true);
                        setError('');

                        stomp.subscribe(
                            `/topic/group/${groupNum}`,
                            frame => {
                                if (disposed) return;
                                const received = JSON.parse(frame.body) as ChatMessage;
                                setMessages(previous => mergeMessages(previous, [received]));
                            }
                        );

                        void loadHistory();
                    },

                    onWebSocketClose: () => {
                        if (!disposed) setConnected(false);
                    },

                    onWebSocketError: () => {
                        if (!disposed) {
                            setConnected(false);
                            setError('채팅 서버에 연결하지 못했습니다.');
                        }
                    },

                    onStompError: () => {
                        if (!disposed) {
                            setConnected(false);
                            setError(
                                '로그인 상태와 스터디룸 가입 여부를 확인해주세요.'
                            );
                        }

                        // 인증·권한 오류에는 자동 재시도를 중단합니다.
                        void stomp.deactivate();
                    }
                });

                client = stomp;
                clientRef.current = stomp;
                stomp.activate();
            } catch {
                if (!disposed) {
                    setError('로그인 정보 또는 채팅 설정을 확인해주세요.');
                }
            }
        };

        void connect();

        return () => {
            disposed = true;

            if (clientRef.current === client) {
                clientRef.current = null;
            }

            if (client) {
                void client.deactivate();
            }
        };
    }, [groupNum]);

    useEffect(() => {
        const window = chatWindowRef.current;

        if (window) {
            window.scrollTop = window.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        const client = clientRef.current;
        const value = message.trim();

        if (!client?.connected || !value || value.length > 1000) return;

        client.publish({
            destination: `/app/chat/${groupNum}`,
            body: JSON.stringify({
                state: 1,
                value
            })
        });

        // 서버가 돌려주는 메시지만 목록에 추가해 중복 표시를 방지합니다.
        setMessage('');
    };

    return (
        <div className={styles.detail_content_wrapper}>
            <div className={styles.detail_section_card}>
                <h3 className={styles.section_title}>질의응답</h3>

                <p className={styles.section_desc}>
                    멤버들이 공부 중 생긴 질문과 답변을 자유롭게 나누는 곳입니다.
                </p>

                <p className={styles.chat_status} role="status">
                    {member?.memberNick}
                    {' · '}
                    {connected ? '채팅 연결됨' : '채팅 연결 안 됨'}
                </p>

                {error && (
                    <p className={styles.chat_error} role="alert">
                        {error}
                    </p>
                )}

                <div
                    ref={chatWindowRef}
                    className={styles.chat_window}
                    role="log"
                    aria-label="스터디룸 채팅"
                    aria-live="polite"
                >
                    {messages.length === 0 && (
                        <p className={styles.chat_empty}>
                            궁금한 내용을 질문해보세요.
                        </p>
                    )}

                    {messages.map(chat => (
                        <div
                            key={chat.chat_num}
                            className={[
                                styles.chat_message,
                                chat.member_num === member?.memberNum
                                    ? styles.chat_message_mine
                                    : ''
                            ].join(' ')}
                        >
                            <strong className={styles.chat_nickname}>
                                {chat.member_nick}
                            </strong>

                            <div className={styles.chat_bubble}>
                                {chat.value}
                            </div>
                            
                            <time dateTime={chat.created_at}>
                                {chat.created_at.replace('T', ' ').slice(0, 16)}
                            </time>
                        </div>
                    ))}
                </div>

                <form
                    className={styles.chat_form}
                    onSubmit={event => {
                        event.preventDefault();
                        sendMessage();
                    }}
                >
                    <input
                        className={styles.chat_input}
                        aria-label="채팅 메시지"
                        value={message}
                        onChange={event => setMessage(event.target.value)}
                        onKeyDown={event => {
                            if (
                                event.key === 'Enter' &&
                                event.nativeEvent.isComposing
                            ) {
                                event.preventDefault();
                            }
                        }}
                        maxLength={1000}
                        disabled={!connected}
                        placeholder="질문이나 답변을 입력하세요."
                    />

                    <button
                        className={styles.chat_send}
                        type="submit"
                        disabled={!connected || !message.trim()}
                    >
                        전송
                    </button>
                </form>
            </div>
        </div>
    );
};
