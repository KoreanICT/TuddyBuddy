import api from "../cont/study_group/api";

export type NotificationType = 'JOIN' | 'REPORT' | 'COMMENT' | 'STUDY_DELETED';

export interface NotificationData {
    notification_num: number;
    category: string;
    title: string;
    message: string;
    target_url: string;
    is_checked: number;
    created_at: string;
}

export const getUnreadNotifications = async (signal?: AbortSignal): Promise<NotificationData[]> => {
    const response = await api.get<NotificationData[]>(
        "/notification/unread",
        { signal }
    );
    return response.data;
};

export const readNotification = async (notificationNum: number): Promise<void> => {
    await api.patch(`/notification/read/${notificationNum}`);
};

export const requestJoin = async (groupNum: number): Promise<void> => {
    await api.post(`/group/requestJoin/${groupNum}`);
};

export const answerJoin = async (notificationNum: number,accept: boolean): Promise<string> => {
    const response = await api.post<string>(
        `/group/answerJoin/${notificationNum}`,
        null,
        { params: { accept } }
    );

    return response.data;
};

export const getAllNotifications = async (
    signal?: AbortSignal
): Promise<NotificationData[]> => {
    const response = await api.get<NotificationData[]>(
        "/notification/getAllNotification",
        { signal }
    );

    return response.data;
};

export const deleteNotification = async (
    notificationNum: number
): Promise<void> => {
    await api.delete(`/notification/delete/${notificationNum}`);
};
