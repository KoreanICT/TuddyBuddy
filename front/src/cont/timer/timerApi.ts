// 최솔
import { Interval, TimerSession, TimerSummary } from './types';

const BASE = (
  process.env.REACT_APP_BACK_END_URL ||
  'http://192.168.0.19:80/back'
).replace(/\/$/, '');


const IS_DEV_TIMER = process.env.NODE_ENV === 'development';

const URL = `${BASE}${
  IS_DEV_TIMER
    ? '/api/dev/timer-sessions'
    : '/api/timer-sessions'
}`;
console.log('TIMER DEV:', IS_DEV_TIMER);
console.log('TIMER URL:', URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_TIMER_DEV:', process.env.REACT_APP_TIMER_DEV);
async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  // 개발용 비로그인 테스트에서는 JWT를 전송하지 않음
  if (!IS_DEV_TIMER) {
    const token = localStorage.getItem('token');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${URL}${path}`, {
    ...init,
    credentials: IS_DEV_TIMER ? 'omit' : 'include',
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `요청 실패 (${response.status})`
    );
  }

  return data as T;
}

export const timerApi = {
  create: (minutes: number) =>
    request<TimerSession>('', {
      method: 'POST',
      body: JSON.stringify({ setTimeMinutes: minutes }),
    }),

  save: (id: number, intervals: Interval[]) =>
    request<TimerSession>(`/${id}/records`, {
      method: 'PUT',
      body: JSON.stringify({ intervals }),
    }),

  summary: () =>
    request<TimerSummary>('/summary'),
};