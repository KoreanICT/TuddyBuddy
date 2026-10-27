import { useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { BACKEND_URL, authenticatedFetch } from "../login/authHttp";

import type { NotificationData } from "./NotificationAPI";
import {
    getUnreadNotifications,
    readNotification,
} from "./NotificationAPI";

export interface NotificationState {
    notifications: NotificationData[];
    hasNewNotification: boolean;
    loading: boolean;
    error: string | null;
    retry: () => void;
    markAsRead: (notificationNum: number) => Promise<void>;
    changeNotification: (notificationNum: number, category: string | null) => void;
}

interface NotificationStore {
    owner: number | null;
    notifications: NotificationData[];
    loading: boolean;
    error: string | null;
}

// 기존 항목의 읽음 상태를 우선하여 병합합니다.
const mergeNotifications = (
    current: NotificationData[],
    incoming: NotificationData[]
): NotificationData[] => {
    const items = new Map<number, NotificationData>();

    incoming.forEach((item: NotificationData) => {
        items.set(item.notification_num, item);
    });

    current.forEach((item: NotificationData) => {
        items.set(item.notification_num, item);
    });

    return Array.from(items.values()).sort(
        (a: NotificationData, b: NotificationData): number =>
            new Date(b.created_at).getTime()
            - new Date(a.created_at).getTime()
            || b.notification_num - a.notification_num
    );
};

export const useNotificationState = (token: string | null, memberNum: number | null): NotificationState => {
    const owner: number | null = token && memberNum !== null ? memberNum : null;
    const [store, setStore] = useState<NotificationStore>({
        owner: null,
        notifications: [],
        loading: false,
        error: null,
    });

    const [retryCount, setRetryCount] = useState<number>(0);

    // 이전 연결에서 시작한 비동기 작업을 구분합니다.
    const generationRef = useRef<number>(0);

    const pendingReadsRef = useRef<Map<number, Promise<void>>>(new Map());

    useEffect(() => {
        if (owner === null) return;
        const refresh = () => setRetryCount(value => value + 1);
        window.addEventListener('notification-refresh', refresh);
        return () => window.removeEventListener('notification-refresh', refresh);
    }, [owner]);

    useEffect(() => {
        const generation: number = ++generationRef.current;
        const controller = new AbortController();

        pendingReadsRef.current.clear();

        const isCurrent = (): boolean => !controller.signal.aborted && generationRef.current === generation;

        const cleanup = (): void => {
            controller.abort();

            if (generationRef.current === generation) {
                generationRef.current += 1;
            }

            pendingReadsRef.current.clear();
        };

        if (!token || owner === null) {
            setStore({
                owner: null,
                notifications: [],
                loading: false,
                error: null,
            });

            return cleanup;
        }

        const currentOwner: number = owner;

        // 같은 회원이면 목록 유지, 다른 회원이면 초기화
        setStore((prev: NotificationStore) => ({
            owner: currentOwner,
            notifications:
                prev.owner === currentOwner
                    ? prev.notifications
                    : [],
            loading: true,
            error: null,
        }));

        const loadNotifications = async (): Promise<void> => {
            try {
                const data = await getUnreadNotifications(
                    controller.signal
                );

                if (!isCurrent()) return;

                setStore((prev: NotificationStore) => {
                    if (prev.owner !== currentOwner) {
                        return prev;
                    }

                    return {
                        ...prev,
                        notifications: mergeNotifications(
                            prev.notifications,
                            data
                        ),
                        loading: false,
                        error: null,
                    };
                });
            } catch {
                if (!isCurrent()) return;

                setStore((prev: NotificationStore) => {
                    if (prev.owner !== currentOwner) {
                        return prev;
                    }

                    return {
                        ...prev,
                        loading: false,
                        error: "알림을 불러오지 못했습니다.",
                    };
                });
            }
        };

        void loadNotifications();

        let failures = 0;
        void fetchEventSource(`${BACKEND_URL}/api/notification/subscribe`, {
            fetch: (input, init) => authenticatedFetch(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, init),
            signal: controller.signal,
            async onopen(response) {
                if (!response.ok || !response.headers.get('content-type')?.includes('text/event-stream')) {
                    if (response.status === 401 || response.status === 403) controller.abort();
                    throw new Error('알림 연결 실패');
                }
                // 연결이 끊긴 동안 저장된 알림도 다시 조회한다.
                void loadNotifications();
            },
            onmessage(event) {
                if (!isCurrent()) return;
                if (event.event === 'connect') return;
                if (event.event !== 'notification') return;
                try {
                    const data = JSON.parse(event.data) as NotificationData;
                    if (!Number.isSafeInteger(data.notification_num) || !data.created_at ||
                        Number.isNaN(Date.parse(data.created_at)) || typeof data.category !== 'string') return;
                    failures = 0;
                    setStore(prev => prev.owner === currentOwner
                        ? {...prev, notifications: mergeNotifications(prev.notifications, [data])} : prev);
                    window.dispatchEvent(new CustomEvent('notification-received', {detail: {category: data.category}}));
                } catch { /* 잘못된 이벤트는 목록에 추가하지 않는다. */ }
            },
            onclose() { throw new Error('알림 연결 종료'); },
            onerror(error) {
                if (!isCurrent() || ++failures >= 5) throw error;
                return Math.min(30000, 2000 * 2 ** (failures - 1));
            },
        }).catch(() => {
            if (isCurrent()) setStore(prev => prev.owner === currentOwner
                ? {...prev, error: '실시간 알림 연결이 끊겼습니다. 다시 시도해주세요.'} : prev);
        });

        return cleanup;
    }, [token, owner, retryCount]);

    const markAsRead = (
        notificationNum: number
    ): Promise<void> => {
        if (owner === null || store.owner !== owner) {
            return Promise.reject(
                new Error("로그인 정보를 확인해주세요.")
            );
        }

        const pending =
            pendingReadsRef.current.get(notificationNum);

        if (pending) {
            return pending;
        }

        const generation: number = generationRef.current;
        const requestOwner: number = owner;

        const request: Promise<void> = (async (): Promise<void> => {
            try {
                await readNotification(notificationNum);

                if (generationRef.current !== generation) {
                    throw new Error(
                        "알림 처리 중 로그인 또는 연결 상태가 변경되었습니다."
                    );
                }

                setStore((prev: NotificationStore) => {
                    if (prev.owner !== requestOwner) {
                        return prev;
                    }

                    return {
                        ...prev,
                        notifications: prev.notifications.map(
                            (item: NotificationData) =>
                                item.notification_num === notificationNum
                                    ? { ...item, is_checked: 1 }
                                    : item
                        ),
                    };
                });
            } finally {
                // 이전 요청이 새 연결의 요청 정보를 지우지 않도록 방지
                if (generationRef.current === generation) {
                    pendingReadsRef.current.delete(
                        notificationNum
                    );
                }
            }
        })();

        pendingReadsRef.current.set(notificationNum, request);

        return request;
    };

    const retry = (): void => {
        setRetryCount((prev: number) => prev + 1);
    };

    // effect 실행 전에도 이전 회원의 목록을 노출하지 않습니다.
    const isCurrentOwner: boolean = owner !== null && store.owner === owner;

    const notifications: NotificationData[] = isCurrentOwner ? store.notifications : [];
    const changeNotification = (notificationNum: number, category: string | null): void => {
        setStore((prev: NotificationStore) => ({
            ...prev,
            notifications: category === null
                ? prev.notifications.filter(
                    item => item.notification_num !== notificationNum
                )
                : prev.notifications.map(
                    item => item.notification_num === notificationNum
                        ? { ...item, category, is_checked: 1 }
                        : item
                ),
        }));
    };

    return {
        notifications,
        hasNewNotification: notifications.some(
            (item: NotificationData) => item.is_checked === 0
        ),
        loading:
            owner !== null
            && (!isCurrentOwner || store.loading),
        error: isCurrentOwner ? store.error : null,
        retry,
        markAsRead,
        changeNotification,
    };
};
