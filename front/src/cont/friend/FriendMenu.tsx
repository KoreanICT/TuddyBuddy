
 // 주용현

import React from 'react';
import { Users, Inbox, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const FriendMenu: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const menus = [
        { path: '/friend/list', label: '내 친구', icon: Users },
        { path: '/friend/request', label: '받은 요청', icon: Inbox },
        { path: '/friend/sent', label: '보낸 요청', icon: Send }
    ];

    return (
        <nav aria-label="친구 관리 메뉴" style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {menus.map(menu => {
                const Icon = menu.icon;
                const active = pathname === menu.path;

                return (
                    <button
                        key={menu.path}
                        type="button"
                        onClick={() => navigate(menu.path)}
                        aria-current={active ? 'page' : undefined}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: active ? '#2563eb' : '#fff',
                            color: active ? '#fff' : '#333',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Icon size={17} />
                        {menu.label}
                    </button>
                );
            })}
        </nav>
    );
};

export default FriendMenu;
