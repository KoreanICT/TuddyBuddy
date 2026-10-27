import { act, renderHook, waitFor } from '@testing-library/react';
import { useNotificationState } from './useNotificationState';
import { getUnreadNotifications } from './NotificationAPI';
import { fetchEventSource } from '@microsoft/fetch-event-source';

jest.mock('@microsoft/fetch-event-source', () => ({fetchEventSource: jest.fn(() => Promise.resolve())}));
jest.mock('./NotificationAPI', () => ({getUnreadNotifications: jest.fn(), readNotification: jest.fn()}));
const load = getUnreadNotifications as jest.MockedFunction<typeof getUnreadNotifications>;
beforeEach(() => {
    jest.clearAllMocks();
    (fetchEventSource as jest.Mock).mockResolvedValue(undefined);
});

test('관리자 스터디 삭제 후 이벤트로 로그인 중인 방장의 새 알림을 조회한다', async () => {
    load.mockResolvedValueOnce([]).mockResolvedValue([{
        notification_num: 9, category: 'STUDY_DELETED', title: '참여 중인 스터디가 삭제되었습니다',
        message: '삭제 안내', target_url: '/group', is_checked: 0, created_at: '2026-10-26T12:00:00'
    }]);
    const hook = renderHook(() => useNotificationState('token', 1));
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    expect(hook.result.current.hasNewNotification).toBe(false);
    act(() => { window.dispatchEvent(new Event('notification-refresh')); });
    await waitFor(() => expect(hook.result.current.notifications).toHaveLength(1));
    expect(hook.result.current.hasNewNotification).toBe(true);
    expect(load).toHaveBeenCalledTimes(2);
    hook.unmount();
    act(() => { window.dispatchEvent(new Event('notification-refresh')); });
    expect(load).toHaveBeenCalledTimes(2);
});

test('로그아웃 상태에서는 갱신 이벤트가 와도 알림 요청을 하지 않는다', () => {
    const hook = renderHook(() => useNotificationState(null, null));
    act(() => { window.dispatchEvent(new Event('notification-refresh')); });
    expect(load).not.toHaveBeenCalled();
    hook.unmount();
});

test('친구 요청 SSE를 목록에 반영하고 연결은 화면 종료 시 해제한다', async () => {
    load.mockResolvedValue([]);
    const hook = renderHook(() => useNotificationState('token', 1));
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    const options = (fetchEventSource as jest.Mock).mock.calls[0][1];
    const received = jest.fn();
    window.addEventListener('notification-received', received);
    act(() => options.onmessage({event: 'notification', data: JSON.stringify({
        notification_num: 12, category: 'FRIEND_REQUEST', title: '새로운 친구 요청',
        message: '친구 요청', target_url: '/friend/request', is_checked: 0, created_at: '2026-10-27T10:00:00'
    })}));
    expect(hook.result.current.notifications[0].category).toBe('FRIEND_REQUEST');
    expect(hook.result.current.hasNewNotification).toBe(true);
    expect(received).toHaveBeenCalledTimes(1);
    expect(options.onerror(new Error('offline'))).toBe(2000);
    expect(options.onerror(new Error('offline'))).toBe(4000);
    expect(options.onerror(new Error('offline'))).toBe(8000);
    expect(options.onerror(new Error('offline'))).toBe(16000);
    expect(() => options.onerror(new Error('offline'))).toThrow('offline');
    hook.unmount();
    expect(options.signal.aborted).toBe(true);
    window.removeEventListener('notification-received', received);
});
