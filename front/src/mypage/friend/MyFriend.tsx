import React, { useState } from 'react';
import { Users, UserPlus, Inbox, Send } from 'lucide-react';
import FriendList from '../../cont/friend/FriendList';
import FriendAdd from '../../cont/friend/FriendAdd';
import FriendRequestList from '../../cont/friend/FriendRequestList';
import FriendSentList from '../../cont/friend/FriendSentList';
import styles from './myFriend.module.css';

type FriendView = 'list' | 'add' | 'request' | 'sent';
const menus = [
    { key: 'list' as const, label: '내 친구', icon: Users },
    { key: 'add' as const, label: '친구 추가', icon: UserPlus },
    { key: 'request' as const, label: '받은 요청', icon: Inbox },
    { key: 'sent' as const, label: '보낸 요청', icon: Send },
];

const MyFriend: React.FC = () => {
    const [view, setView] = useState<FriendView>('list');
    return (
        <div className={styles.container}>
            <nav className={styles.actions} aria-label="마이페이지 친구 관리">
                {menus.map(({ key, label, icon: Icon }) => (
                    <button key={key} type="button" aria-pressed={view === key}
                        className={view === key ? styles.active : undefined}
                        onClick={() => setView(key)}>
                        <Icon size={17} aria-hidden="true" />{label}
                    </button>
                ))}
            </nav>
            {view === 'list' && <FriendList embedded />}
            {view === 'add' && <FriendAdd embedded />}
            {view === 'request' && <FriendRequestList embedded />}
            {view === 'sent' && <FriendSentList embedded />}
        </div>
    );
};

export default MyFriend;