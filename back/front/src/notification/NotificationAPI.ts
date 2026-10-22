export interface NotificationData {
    notification_num: number;
    notification_type: string;
    title: string;
    message: string;
    target_url: string;
    is_read: number;
    created_at: string;
}

export type NotificationType = 'JOIN' | 'REPORT' | 'COMMENT';