import React, { createContext, useContext } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../login/reducers";
import { useNotificationState } from "./useNotificationState";
import type { NotificationState } from "./useNotificationState";

interface NotificationProviderProps {children: React.ReactNode;}

const NotificationContext = createContext<NotificationState | undefined>(undefined);

export const NotificationProvider:
    React.FC<NotificationProviderProps> = ({ children }) => {
        const token = useSelector(
            (state: RootState) => state.auth.token
        );

        const memberNum = useSelector(
            (state: RootState) => state.auth.member_num
        );

        const notificationState: NotificationState = useNotificationState(token, memberNum);

        return (
            <NotificationContext.Provider
                value={notificationState}
            >
                {children}
            </NotificationContext.Provider>
        );
    };

export const useNotification = (): NotificationState => {
    const context = useContext(NotificationContext);

    if (context === undefined) {
        throw new Error(
            "useNotification은 NotificationProvider 내부에서 사용해야 합니다."
        );
    }

    return context;
};