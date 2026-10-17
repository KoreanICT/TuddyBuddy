// 최솔
import { Interval, TimerSession, TimerSummary } from './types';
import store from '../../login/reducers/store';
import { BACKEND_URL, authenticatedFetch } from '../../login/authHttp';

const BASE = BACKEND_URL;


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

  const response = await authenticatedFetch(`${URL}${path}`, {
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
