import React, {useState, useEffect, useCallback} from 'react'
import { useSSE } from './useSSE'
export const NotificationSystem: React.FC = () => {

    const [notification, setNotification] = useState([]);
    const [unreadCunt, setUnreadCount] = useState(0);
    const {data, error, isConnected} = useSSE('http://localhost:8080/api/notifications');

    return (
        <div>

        </div>
    )
}

