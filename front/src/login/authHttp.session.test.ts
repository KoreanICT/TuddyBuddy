import type { AxiosInstance } from 'axios';
import { BACKEND_URL, installAuthInterceptors, memberSessionConfig } from './authHttp';
import { memberSessionKey } from './session';

jest.mock('axios', () => {
    class CanceledError extends Error { __CANCEL__ = true; }
    return {
        __esModule: true,
        default: { create: () => ({ post: jest.fn() }), CanceledError },
        AxiosHeaders: { from: () => ({ set: jest.fn(), delete: jest.fn() }) }
    };
});

const signIn = (id: string, identity: string) => {
    localStorage.setItem('token', `token-${id}`);
    localStorage.setItem('member_num', id);
    localStorage.setItem('username', `member-${id}@example.invalid`);
    localStorage.setItem('auth_session_generation', identity);
};

const handlers = () => {
    const requestUse = jest.fn();
    const responseUse = jest.fn();
    installAuthInterceptors({
        getUri: (config: { url: string }) => config.url,
        interceptors: { request: { use: requestUse }, response: { use: responseUse } }
    } as unknown as AxiosInstance);
    return {
        request: requestUse.mock.calls[0][0],
        success: responseUse.mock.calls[0][0],
        failure: responseUse.mock.calls[0][1]
    };
};

beforeEach(() => localStorage.clear());

test('이전 화면의 요청을 새 계정 토큰으로 전송하지 않는다', () => {
    signIn('1', 'session-a');
    const config = memberSessionConfig(memberSessionKey(), { url: `${BACKEND_URL}/api/member/withdraw` });
    signIn('2', 'session-b');
    expect(() => handlers().request(config)).toThrow('로그인 계정이 변경');
});

test('계정 변경 후 늦게 도착한 성공 응답을 취소한다', () => {
    signIn('1', 'session-a');
    const config = memberSessionConfig(memberSessionKey());
    signIn('2', 'session-b');
    expect(() => handlers().success({ config, data: { success: true } })).toThrow('로그인 계정이 변경');
});

test('이전 세션의401로 새 세션의 갱신을 시도하지 않는다', async () => {
    signIn('1', 'session-a');
    const config = memberSessionConfig(memberSessionKey());
    signIn('2', 'session-b');
    await expect(handlers().failure({ config, response: { status: 401 } })).rejects.toThrow('로그인 계정이 변경');
});

test('계정이 같으면 갱신된 Access Token을 사용할 수 있다', () => {
    signIn('1', 'session-a');
    const key = memberSessionKey();
    localStorage.setItem('token', 'refreshed');
    const result = handlers().request(memberSessionConfig(key, { url: `${BACKEND_URL}/api/member/update` }));
    expect(result._authToken).toBe('refreshed');
});

test('세션 지정이 없는 기존 요청에는 새 제약을 적용하지 않는다', () => {
    signIn('2', 'session-b');
    expect(() => handlers().request({ url: `${BACKEND_URL}/api/member/me` })).not.toThrow();
});
