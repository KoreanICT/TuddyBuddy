import React, { useMemo, useRef, useState } from 'react';
import styles from './notification.module.css';
import { answerJoin, NotificationData } from './NotificationAPI';
import { useNotification } from './NotificationProvider';
import { Link } from 'react-router-dom';
import { reportNotificationLink } from './reportNotificationLink';

interface NotificationModalProps {
    notifications: NotificationData[];
    onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, onClose }) => {

    const [selectedId, setSelectedId] = useState<number | null>(null);
    // 최신 날짜부터 정렬
    const { markAsRead, loading, error, retry, changeNotification } = useNotification();
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [readError, setReadError] = useState<string | null>(null);

    const busyRef = useRef<boolean>(false);

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [notifications]);

    const handleAnswer = async (notificationNum: number, accept: boolean): Promise<void> => {
        if (busyRef.current) return;

        busyRef.current = true;
        setPendingId(notificationNum);
        setReadError(null);

        try {
            const category = await answerJoin(
                notificationNum, accept
            );

            changeNotification(notificationNum, category);
        } catch {
            setReadError(
                "처리에 실패했습니다. 이미 처리된 요청인지, 정원이 남아 있는지 확인해주세요."
            );
        } finally {
            busyRef.current = false;
            setPendingId(null);
        }
    };

    const handleNotificationClick = async (notification: NotificationData): Promise<void> => {

        if (busyRef.current) {
            return;
        }

        if (selectedId === notification.notification_num) {
            setSelectedId(null);
            return;
        }

        setReadError(null);

        if (notification.is_checked === 0) {
            busyRef.current = true;
            setPendingId(notification.notification_num);

            try {
                await markAsRead(
                    notification.notification_num
                );
            } catch (error) {
                setReadError("읽음 처리에 실패하였습니다. 다시 눌러주세요.");
                return;
            } finally {
                busyRef.current = false;
                setPendingId(null);
            }
        }

        setSelectedId(notification.notification_num);
    };

    const getTypeLabel = (type: string): string => {
        switch (type) {
            case 'JOIN': return '스터디룸 참여';
            case 'STUDY_DELETED': return '스터디 삭제';
            case 'REPORT': return '신고';
            case 'COMMENT': return '댓글';
            default: return '';
        }
    }

    return (
        <div className={styles.notificationModal}>
            <div className={styles.notificationHeader}>
                <h3>알림</h3>

                <button
                    type="button"
                    onClick={onClose}
                    className={styles.closeButton}
                    aria-label="알림 창 닫기"
                >
                    ×
                </button>
            </div>

            <div className={styles.notificationList}>
                {loading && (
                    <p role="status">
                        알림을 불러오는 중입니다.
                    </p>
                )}

                {error && (
                    <div role="alert">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={retry}
                            disabled={loading}
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {readError && (
                    <p role="alert">{readError}</p>
                )}

                {!loading && !error && notifications.length === 0 && (
                    <div className={styles.empty}>
                        새로운 알림이 없습니다.
                    </div>
                )}
                {notifications.map(
                    (notification: NotificationData) => {
                        const id: number = notification.notification_num;
                        const isSelected: boolean = selectedId === id;
                        const isUnread: boolean = notification.is_checked === 0;
                        const isReport: boolean = notification.category === "REPORT";

                        return (
                            <div
                                key={id}
                                className={[
                                    styles.notificationItem,
                                    isReport
                                        ? styles.reportNotification
                                        : "",
                                ].join(" ")}
                            >
                                <button
                                    type="button"
                                    className={styles.notificationTitle}
                                    disabled={pendingId !== null}
                                    aria-expanded={isSelected}
                                    onClick={() => {
                                        void handleNotificationClick(
                                            notification
                                        );
                                    }}
                                >
                                    <span>
                                        {isReport && "⚠️ "}
                                        {isUnread && "● "}
                                        [{getTypeLabel(
                                            notification.category
                                        )}]
                                        {notification.title}
                                        {pendingId === id
                                            && " (처리 중)"}
                                    </span>

                                    <span
                                        className={
                                            styles.notificationDate
                                        }
                                    >
                                        {new Date(
                                            notification.created_at
                                        ).toLocaleString()}
                                    </span>
                                </button>

                                {isSelected && (
                                    <div className={styles.notificationContent}>
                                        <p>{notification.message}</p>
                                        {notification.category === 'STUDY_DELETED' && <p><Link to="/group" onClick={onClose}>스터디 목록으로 이동</Link></p>}
                                        {reportNotificationLink(notification.category, notification.target_url) && (
                                            <p><Link to={notification.target_url} onClick={onClose}>신고 내용 확인</Link></p>
                                        )}

                                        {notification.category === "JOIN" && (
                                            <div>
                                                <button
                                                    type="button"
                                                    disabled={pendingId !== null || loading}
                                                    onClick={() => {
                                                        void handleAnswer(id, true);
                                                    }}
                                                >
                                                    수락
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={pendingId !== null || loading}
                                                    onClick={() => {
                                                        void handleAnswer(id, false);
                                                    }}
                                                >
                                                    거절
                                                </button>
                                            </div>
                                        )}

                                        {notification.category === "JOIN_APPROVED" && (
                                            <p>수락 처리된 알림입니다.</p>
                                        )}

                                        {notification.category === "JOIN_REJECTED" && (
                                            <p>거절 처리된 알림입니다.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
};
