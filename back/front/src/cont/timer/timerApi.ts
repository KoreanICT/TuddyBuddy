// 최솔
import { Interval, TimerSession, TimerSummary } from './types';
import store from '../../login/reducers/store';
import { BACKEND_URL, authenticatedFetch } from '../../login/authHttp';

const BASE = BACKEND_URL;


const URL = `${BASE}/api/timer-sessions`;

function normalizeSession(value: unknown): TimerSession {
  if (!value || typeof value !== 'object') {
    throw new Error('타이머 세션 응답이 올바르지 않습니다.');
  }

  const data = value as Record<string, unknown>;
  const timerSessionId = Number(data.timerSessionId ?? data.timer_session_id);
  if (!Number.isSafeInteger(timerSessionId) || timerSessionId <= 0) {
    throw new Error('타이머 세션 번호를 확인할 수 없습니다. 새 타이머를 시작해주세요.');
  }

  const setTimeMinutes = Number(data.setTimeMinutes ?? data.set_time_minutes);
  const totalTimeSeconds = Number(data.totalTimeSeconds ?? data.total_time_seconds);

  return {
    timerSessionId,
    setTimeMinutes: Number.isFinite(setTimeMinutes) ? setTimeMinutes : 0,
    totalTimeSeconds: Number.isFinite(totalTimeSeconds) ? totalTimeSeconds : 0,
  };
}

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
  create: async (minutes: number): Promise<TimerSession> =>
    normalizeSession(await request<unknown>('', {
      method: 'POST',
      body: JSON.stringify({ setTimeMinutes: minutes }),
    })),

  save: async (id: number, intervals: Interval[]): Promise<TimerSession> => {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error('타이머 세션 번호가 올바르지 않습니다.');
    }

    return normalizeSession(await request<unknown>(`/${id}/records`, {
      method: 'PUT',
      body: JSON.stringify({ intervals }),
    }));
  },

  summary: async (): Promise<TimerSummary> => {
    const data = await request<Partial<TimerSummary> | null>('/summary');
    const totalTimeSeconds = data?.totalTimeSeconds;
    const sessions = data?.sessions;

    return {
      totalTimeSeconds: typeof totalTimeSeconds === 'number' && Number.isFinite(totalTimeSeconds)
        ? totalTimeSeconds
        : 0,
      sessions: Array.isArray(sessions) ? sessions : [],
    };
  },
};
