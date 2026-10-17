// 최솔
import { Interval, TimerSession, TimerSummary } from './types';
import store from '../../login/reducers/store';

const BASE = (
  process.env.REACT_APP_BACK_END_URL ||
  'http://192.168.0.19:80/back'
).replace(/\/$/, '');


const URL = `${BASE}/api/timer-sessions`;

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const token = store.getState().auth.token;
  if (!token) throw new Error('로그인이 필요합니다.');
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${URL}${path}`, {
    ...init,
    credentials: 'include',
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