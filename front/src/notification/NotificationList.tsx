import { UserRoundPlus, ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from "react";
import styles from './notification.module.css'
import { getAllNotifications, deleteNotification } from "./NotificationAPI";
import type { NotificationData } from "./NotificationAPI";
import { useNotification } from "./NotificationProvider";
import { Link } from 'react-router-dom';
import { reportNotificationLink } from './reportNotificationLink';

export const NotificationList: React.FC = () => {
    const [notifications, setNotifications] =
        useState<NotificationData[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const refresh = () => setRevision(value => value + 1);
        window.addEventListener('notification-refresh', refresh);
        window.addEventListener('notification-received', refresh);
        return () => {
            window.removeEventListener('notification-refresh', refresh);
            window.removeEventListener('notification-received', refresh);
        };
    }, []);

    const { changeNotification } = useNotification();

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        const loadNotifications = async (): Promise<void> => {
            try {
                const data = await getAllNotifications(
                    controller.signal
                );

                if (!controller.signal.aborted) {
                    setNotifications(data);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setError("알림을 불러오지 못했습니다.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void loadNotifications();

        return () => {
            controller.abort();
        };
    }, [revision]);

    const handleDelete = async (
        notification: NotificationData
    ): Promise<void> => {
        if (deleting) return;

        const message = notification.category === "JOIN"
            ? "대기 중인 참여 요청입니다. 삭제하면 이 요청을 처리할 수 없습니다. 삭제할까요?"
            : "이 알림을 삭제할까요?";

        if (!window.confirm(message)) return;

        setDeleting(true);
        setError(null);

        try {
            await deleteNotification(
                notification.notification_num
            );

            // 전체 알림 목록에서 제거
            setNotifications(prev =>prev.filter(item => item.notification_num !== notification.notification_num));

            // 헤더 알림 목록에서도 제거
            changeNotification(notification.notification_num,null);
        } catch {
            setError("알림 삭제에 실패했습니다.");
        } finally {
            setDeleting(false);
        }
    };

    return (
    <section className={styles.page}>
        <header className={styles.pageHeader}>
            <div>
                <h2>알림</h2>
                <p>제목을 누르면 상세 내용을 확인할 수 있습니다.</p>
            </div>

            <span className={styles.count}>
                총 {notifications.length}개
            </span>
        </header>

        {loading && (
            <div className={styles.status} role="status">
                알림을 불러오는 중입니다.
            </div>
        )}

        {error && (
            <div className={styles.error} role="alert">
                {error}
            </div>
        )}

        {!loading && !error && notifications.length === 0 && (
            <div className={styles.status}>
                받은 알림이 없습니다.
            </div>
        )}

        <ul className={styles.list}>
            {notifications.map(notification => (
                <li
                    key={notification.notification_num}
                    className={styles.item}
                >
                    <details className={styles.details}>
                        <summary className={styles.summary}>
                            <span
                                className={`${styles.badge} ${
                                    notification.category === "REPORT"
                                        ? styles.reportBadge
                                        : ""
                                }`}
                            >
                                {notification.category === "REPORT"
                                    ? "신고"
                                    : notification.category === "COMMENT"
                                        ? "댓글"
                                        : notification.category === "STUDY_DELETED" ? "스터디 삭제"
                                        : notification.category === "FRIEND_REQUEST" ? "친구 요청"
                                        : notification.category === "FRIEND_ACCEPTED" ? "친구 수락"
                                        : "스터디"}
                            </span>

                            <span className={styles.title}>
                                {notification.title}
                            </span>

                            <time
                                className={styles.date}
                                dateTime={notification.created_at}
                            >
                                {new Date(
                                    notification.created_at
                                ).toLocaleDateString("ko-KR")}
                            </time>

                            <span
                                className={styles.arrow}
                                aria-hidden="true"
                            >
                                ⌄
                            </span>
                        </summary>

                        <div className={styles.content}>
                            <p className={styles.message}>
                                {notification.message}
                            </p>

                            {notification.category === "JOIN_APPROVED" && (
                                <p className={styles.result}>
                                    수락 처리된 요청입니다.
                                </p>
                            )}

                            {notification.category === "JOIN_REJECTED" && (
                                <p className={styles.result}>
                                    거절 처리된 요청입니다.
                                </p>
                            )}

                            <footer className={styles.contentFooter}>
                                {notification.category === 'STUDY_DELETED' && <Link to="/group">스터디 목록으로 이동</Link>}
                                {notification.category === 'FRIEND_REQUEST' && <Link className={styles.friendRequestLink} to="/friend/request"><UserRoundPlus size={16} aria-hidden="true" />받은 요청 보기<ArrowRight size={15} aria-hidden="true" /></Link>}
                                {notification.category === 'FRIEND_ACCEPTED' && <Link className={styles.friendRequestLink} to="/friend/list"><UserRoundPlus size={16} aria-hidden="true" />내 친구 보기<ArrowRight size={15} aria-hidden="true" /></Link>}
                                {reportNotificationLink(notification.category, notification.target_url) && (
                                    <Link to={notification.target_url}>신고 내용 확인</Link>
                                )}
                                <span className={styles.fullDate}>
                                    {new Date(
                                        notification.created_at
                                    ).toLocaleString("ko-KR")}
                                </span>

                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    disabled={deleting}
                                    onClick={() => {
                                        void handleDelete(notification);
                                    }}
                                >
                                    삭제
                                </button>
                            </footer>
                        </div>
                    </details>
                </li>
            ))}
        </ul>
    </section>
);
};
