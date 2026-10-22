import { createContext, useContext, useEffect, useState } from "react";
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { NotificationData } from "./NotificationAPI";
import { useSelector } from 'react-redux';
import { RootState } from "../login/reducers";
import api from "../cont/study_group/api";

interface NotificationContextType {
    notifications: NotificationData[];
    hasNewNotification: boolean;
    setHasNewNotification: React.Dispatch<React.SetStateAction<boolean>>;
    markAsRead: (notificationNum: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    hasNewNotification: false,
    setHasNewNotification: () => {},
    markAsRead: async () => {}
})

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const token = useSelector((state: RootState) => state.auth.token)
    const member_num = useSelector((state: RootState) => state.auth.member_num)
    const [hasNewNotification, setHasNewNotification] = useState(false);

    const markAsRead = async (notificationNum: number) => {
        try {
            await api.patch(
                `/notification/read/${notificationNum}`
            );

            setNotifications((prev) => prev.map((item) => item.notification_num === notificationNum ? {...item, is_read: 1} : item))
        } catch (error) {
            console.error('알림 읽음 처리 실패', error);
        }
    }
    useEffect(() => {

        if (!token || member_num === null) {
            return;
        }

        const controller = new AbortController();

        fetchEventSource('http://localhost/back/api/notification/subscribe',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    member_num: String(member_num)
                },
                signal: controller.signal,
                onmessage(event) {
                    if (event.event !== 'notification') {
                        return;
                    }

                    const data = JSON.parse(event.data) as NotificationData;

                    setNotifications((prev) => [data, ...prev]);

                    setHasNewNotification(true);
                }
            }
        );
        return () => {controller.abort()};
    },[token, member_num])

    useEffect(() => {
        if(!token || member_num === null) {
            return;
        }

        const loadUnreadNotifications = async() => {
            try {
                const response = await api.get<NotificationData[]>(
                    '/notification/unread'
                );
                setNotifications(response.data);
                if (response.data.length > 0) {
                    setHasNewNotification(true);
                }
            } catch(error) {
                console.error('알림 조회 실패', error);
            }
        };

        loadUnreadNotifications();

    },[token, member_num])

    return (
        <NotificationContext.Provider value={{notifications, hasNewNotification, setHasNewNotification, markAsRead}}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () =>  useContext(NotificationContext);