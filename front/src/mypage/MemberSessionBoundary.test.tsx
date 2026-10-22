import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MemberSessionBoundary from './MemberSessionBoundary';

jest.mock('../login/hooks/useAuth', () => ({ useAuth: () => ({}) }));

const signIn = (id: string, identity: string, token = 'test-token') => {
    localStorage.setItem('token', token);
    localStorage.setItem('member_num', id);
    localStorage.setItem('username', `member-${id}@example.invalid`);
    localStorage.setItem('auth_session_generation', identity);
};

const ProfileDraft = () => {
    const [draft, setDraft] = useState('');
    return <>
        <p>회원 {localStorage.getItem('member_num')}</p>
        <input aria-label="닉네임" value={draft} onChange={event => setDraft(event.target.value)} />
    </>;
};

beforeEach(() => localStorage.clear());

test('다른 탭 계정 전환 시 기존 화면과 입력값을 폐기한다', () => {
    signIn('1', 'session-a');
    render(<MemberSessionBoundary>{() => <ProfileDraft />}</MemberSessionBoundary>);
    fireEvent.change(screen.getByLabelText('닉네임'), { target: { value: '이전 계정 입력' } });
    signIn('2', 'session-b');
    fireEvent(window, new StorageEvent('storage', { key: 'auth_session_generation' }));
    expect(screen.queryByText('회원 1')).toBeNull();
    expect(screen.getByText('회원 2')).toBeTruthy();
    expect((screen.getByLabelText('닉네임') as HTMLInputElement).value).toBe('');
});

test('다른 탭 로그아웃 시 이전 프로필을 숨긴다', () => {
    signIn('1', 'session-a');
    render(<MemberSessionBoundary>{() => <ProfileDraft />}</MemberSessionBoundary>);
    localStorage.removeItem('token');
    fireEvent(window, new StorageEvent('storage', { key: 'token' }));
    expect(screen.queryByLabelText('닉네임')).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('로그인이 필요');
});

test('같은 계정의 Access Token 갱신은 작성 중인 입력을 유지한다', () => {
    signIn('1', 'session-a');
    render(<MemberSessionBoundary>{() => <ProfileDraft />}</MemberSessionBoundary>);
    fireEvent.change(screen.getByLabelText('닉네임'), { target: { value: '작성 중' } });
    localStorage.setItem('token', 'refreshed-token');
    fireEvent(window, new StorageEvent('storage', { key: 'token' }));
    expect((screen.getByLabelText('닉네임') as HTMLInputElement).value).toBe('작성 중');
});
