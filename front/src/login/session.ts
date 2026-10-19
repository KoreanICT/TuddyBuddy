export interface AuthSession {
  username: string;
  token: string;
  member_num: number;
  authority: string;
}

let generation = 0;
let publishSession: (session: AuthSession | null) => void = () => {};
const BLOCKED_KEY = 'auth_refresh_blocked';
const GENERATION_KEY = 'auth_session_generation';
let activeIdentity = localStorage.getItem(GENERATION_KEY) || '';

export const sessionGeneration = () => generation;
export const refreshBlocked = () => localStorage.getItem(BLOCKED_KEY) === 'true';
export const currentToken = () => refreshBlocked() ? '' : localStorage.getItem('token') || '';
export const sessionIdentity = () => localStorage.getItem(GENERATION_KEY) || '';
export const beginAuthAttempt = () => {
  activeIdentity = `${Date.now()}-${Math.random()}`;
  localStorage.setItem(GENERATION_KEY, activeIdentity);
  return ++generation;
};

export function configureSession(publish: typeof publishSession) {
  publishSession = publish;
  window.addEventListener('storage', event => {
    if (event.key !== null && !['token', 'username', 'member_num', 'authority', BLOCKED_KEY, GENERATION_KEY].includes(event.key)) return;
    if (event.key === GENERATION_KEY || event.key === null) {
      generation++;
      activeIdentity = sessionIdentity();
    }
    const token = currentToken();
    const memberNum = Number(localStorage.getItem('member_num'));
    if (token && Number.isFinite(memberNum)) {
      publishSession({ token, member_num: memberNum, username: localStorage.getItem('username') || '', authority: localStorage.getItem('authority') || '' });
    } else {
      publishSession(null);
    }
  });
  if (refreshBlocked()) clearSession();
}

export function saveSession(session: AuthSession, expectedGeneration: number) {
  if (generation !== expectedGeneration || sessionIdentity() !== activeIdentity) return false;
  localStorage.setItem('token', session.token);
  localStorage.setItem('username', session.username);
  localStorage.setItem('member_num', String(session.member_num));
  localStorage.setItem('authority', session.authority);
  localStorage.removeItem(BLOCKED_KEY);
  publishSession(session);
  return true;
}

// Persist the opt-out even when server logout is unavailable. Only explicit login clears it.
export function clearSession() {
  beginAuthAttempt();
  localStorage.setItem(BLOCKED_KEY, 'true');
  ['token', 'username', 'member_num', 'authority'].forEach(key => localStorage.removeItem(key));
  publishSession(null);
}

export function sessionFromResponse(data: unknown, tokenKey = 'accessToken'): AuthSession {
  const value = data as Record<string, unknown> | null;
  if (!value || typeof value[tokenKey] !== 'string' || !value[tokenKey] ||
      typeof value.username !== 'string' || !value.username ||
      typeof value.member_num !== 'number' || !Number.isFinite(value.member_num) ||
      typeof value.authority !== 'string' || !value.authority) {
    throw new Error('인증 응답을 확인할 수 없습니다.');
  }
  return { token: value[tokenKey] as string, username: value.username, member_num: value.member_num, authority: value.authority };
}
