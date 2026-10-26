import { act, renderHook, waitFor } from '@testing-library/react';
import { useNotificationState } from './useNotificationState';
import { getUnreadNotifications } from './NotificationAPI';

jest.mock('@microsoft/fetch-event-source', () => ({fetchEventSource: jest.fn()}));
jest.mock('./NotificationAPI', () => ({getUnreadNotifications: jest.fn(), readNotification: jest.fn()}));
const load = getUnreadNotifications as jest.MockedFunction<typeof getUnreadNotifications>;
beforeEach(() => jest.clearAllMocks());

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
