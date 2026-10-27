import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import PointHistory from './PointHistory';

jest.mock('axios', () => ({ __esModule: true, default: {
  get: jest.fn(), create: () => ({}), isCancel: () => false,
  isAxiosError: (value: unknown) => !!(value as { response?: unknown })?.response
} }));
jest.mock('../login/hooks/useAuth', () => ({ useAuth: () => ({}) }));

const get = axios.get as jest.Mock;
const item = { point_num: 1, regdate: '2026-10-22', amount: 300, balance_after: 1300, description: '출석 체크 적립' };
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'token-a');
  localStorage.setItem('member_num', '28');
  localStorage.setItem('username', 'member@example.invalid');
  localStorage.setItem('auth_session_generation', 'session-a');
  get.mockReset();
});

test('조회 결과의 네 항목을 표시하고 회원번호를 요청에 보내지 않는다', async () => {
  get.mockResolvedValue({ data: [item] });
  render(<PointHistory embedded />);
  expect(await screen.findByText('출석 체크 적립')).toBeTruthy();
  expect(screen.getByText('2026.10.22')).toBeTruthy();
  expect(screen.getByText('+300P')).toBeTruthy();
  expect(screen.getByText('1,300P')).toBeTruthy();
  expect(get.mock.calls[0][0]).toMatch(/\/api\/member\/point-history$/);
  expect(get.mock.calls[0][1].params).toBeUndefined();
});

test('내역이 없으면 빈 상태를 표시한다', async () => {
  get.mockResolvedValue({ data: [] });
  render(<PointHistory />);
  expect(await screen.findByText('포인트 변동 내역이 없습니다.')).toBeTruthy();
});

test('모달은 부모의 조회 결과를 표시하고 중복 요청하지 않는다', () => {
  render(<PointHistory embedded history={[item]} />);
  expect(screen.getByText('출석 체크 적립')).toBeTruthy();
  expect(screen.getByText('+300P')).toBeTruthy();
  expect(get).not.toHaveBeenCalled();
});

test('모달의 로딩과 오류 및 재시도는 부모의 상태를 사용한다', () => {
  const retry = jest.fn();
  const view = render(<PointHistory embedded history={[]} loading />);
  expect(screen.getByRole('status').textContent).toContain('불러오는 중');
  view.rerender(<PointHistory embedded history={[]} error="조회 실패" onRetry={retry} />);
  expect(screen.getByRole('alert').textContent).toBe('조회 실패');
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(retry).toHaveBeenCalledTimes(1);
  expect(get).not.toHaveBeenCalled();
});

test('잘못된 응답은 오류로 표시하고 재시도한다', async () => {
  get.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce({ data: [item] });
  render(<PointHistory />);
  expect(await screen.findByRole('alert')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('출석 체크 적립')).toBeTruthy();
});

test('닫으면 요청을 취소하고 다시 열면 새 내역을 조회한다', async () => {
  get.mockImplementationOnce(() => new Promise(() => {})).mockResolvedValueOnce({ data: [] });
  const first = render(<PointHistory embedded />);
  const signal = get.mock.calls[0][1].signal;
  first.unmount();
  expect(signal.aborted).toBe(true);
  render(<PointHistory embedded />);
  expect(await screen.findByText('포인트 변동 내역이 없습니다.')).toBeTruthy();
  expect(get).toHaveBeenCalledTimes(2);
});

test('계정 전환 후 이전 응답은 표시하지 않는다', async () => {
  let resolveOld: (value: unknown) => void = () => {};
  get.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
    .mockResolvedValueOnce({ data: [] });
  render(<PointHistory embedded />);
  localStorage.setItem('auth_session_generation', 'session-b');
  localStorage.setItem('member_num', '29');
  fireEvent(window, new StorageEvent('storage', { key: 'auth_session_generation' }));
  expect(await screen.findByText('포인트 변동 내역이 없습니다.')).toBeTruthy();
  await act(async () => { resolveOld({ data: [item] }); });
  expect(screen.queryByText('출석 체크 적립')).toBeNull();
});
