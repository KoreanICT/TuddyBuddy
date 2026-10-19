import React, { useMemo, useState } from 'react';
import styles from './notification.module.css';
import { NotificationData } from './NotificationAPI';
import { useNotification } from './NotificationProvider';

interface NotificationModalProps {
    notifications: NotificationData[];
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, onClose }) => {

    const [selectedId, setSelectedId] = useState<number | null>(null);
    // 최신 날짜부터 정렬
    const { markAsRead } = useNotification();
    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [notifications]);

    const handleNotificationClick = async (notification: NotificationData) => {

        if (notification.is_read === 0) {
            await markAsRead(
                notification.notification_num
            );
        }

        setSelectedId((prev) => prev === notification.notification_num ? null : notification.notification_num);
    };

    const getTypeLabel = (type: string): string => {
        switch (type) {
            case 'JOIN': return '스터디';
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
                >
                    ×
                </button>
            </div>

            <div className={styles.notificationList}>
                {sortedNotifications.length === 0 ? (
                    <div className={styles.empty}>
                        새로운 알림이 없습니다.
                    </div>
                ) : (
                    sortedNotifications.map((notification) => {

                        const isReport = notification.notification_type === 'REPORT';
                        const isSelected = selectedId === notification.notification_num;

                        return (
                            <div
                                key={notification.notification_num}
                                className={`${styles.notificationItem} ${isReport
                                        ? styles.reportNotification
                                        : ''
                                    }`}
                            >
                                <button
                                    type="button"
                                    className={styles.notificationTitle}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                >
                                    <span>
                                        {isReport && '⚠️ '}
                                        [{getTypeLabel(notification.notification_type)}]
                                        {notification.title}
                                    </span>

                                    <span className={styles.notificationDate}>
                                        {new Date(notification.created_at).toLocaleString()}
                                    </span>
                                </button>

                                {isSelected && (
                                    <div className={styles.notificationContent}>
                                        {notification.message}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NotificationModal;