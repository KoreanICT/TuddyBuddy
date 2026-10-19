import axios, { AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { beginAuthAttempt, clearSession, currentToken, refreshBlocked, saveSession, sessionFromResponse, sessionGeneration, sessionIdentity } from './session';

export const BACKEND_URL = (process.env.REACT_APP_BACK_END_URL || 'http://localhost/back').replace(/\/$/, '');
const backend = new URL(BACKEND_URL, window.location.origin);
// Only known historical backend origins may be redirected; arbitrary external URLs never receive credentials.
const legacyOrigins = new Set(['http://localhost', 'http://127.0.0.1', 'http://192.168.0.19', 'http://192.168.0.20', 'http://192.168.0.44']);
const rawClient = axios.create({ withCredentials: true, timeout: 15000 });
let refreshFlight: Promise<string> | null = null;
let authQueue: Promise<unknown> = Promise.resolve();
let pendingAuthOperations = 0;

export function backendRequestUrl(value: string): string | null {
  const url = new URL(value, window.location.origin);
  const prefix = backend.pathname.replace(/\/$/, '');
  if (url.origin === backend.origin && (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) return url.href;
  if (legacyOrigins.has(url.origin) && url.pathname.startsWith('/back/api/')) {
    return `${BACKEND_URL}${url.pathname.slice('/back'.length)}${url.search}`;
  }
  return null;
}

const isAuthEndpoint = (url: string) => new URL(url, window.location.origin).pathname.includes('/api/auth/');

type CookieLockManager = { request<T>(name: string, operation: () => Promise<T>): Promise<T> };
function withCookieLock<T>(operation: () => Promise<T>): Promise<T> {
  const locks = (navigator as unknown as { locks?: CookieLockManager }).locks;
  return locks ? locks.request('tuddybuddy-auth-cookie', operation) : operation();
}

// Serialize cookie-changing sign-in/sign-out with each other and any older refresh.
export function authOperation<T>(operation: (ticket: number) => Promise<T>): Promise<T> {
  pendingAuthOperations++;
  const ticket = beginAuthAttempt();
  const previousRefresh = refreshFlight;
  const result = authQueue.catch(() => undefined).then(async () => {
    if (previousRefresh) await previousRefresh.catch(() => undefined);
    return withCookieLock(() => operation(ticket));
  }).finally(() => { pendingAuthOperations--; });
  authQueue = result.catch(() => undefined);
  return result;
}

export function authPost<T>(url: string, body: unknown): Promise<{ data: T; authTicket: number }> {
  return authOperation(async authTicket => {
    const response = await rawClient.post<T>(url, body);
    return { data: response.data, authTicket };
  });
}

export function refreshAccessToken(): Promise<string> {
  if (refreshFlight) return refreshFlight;
  if (pendingAuthOperations) return Promise.reject(new Error('인증 상태를 변경하고 있습니다. 잠시 후 다시 시도해주세요.'));
  const token = currentToken();
  const epoch = sessionGeneration();
  const identity = sessionIdentity();
  if (!token || refreshBlocked()) return Promise.reject(new Error('로그인이 필요합니다.'));

  const flight = withCookieLock(async () => {
    if (sessionIdentity() !== identity || refreshBlocked() || !currentToken()) {
      throw new Error('인증 상태가 변경되었습니다.');
    }
    // Another tab may have rotated the shared cookie while this tab waited for its lock.
    if (currentToken() !== token) return currentToken();
    try {
      const response = await rawClient.post(`${BACKEND_URL}/api/auth/refresh`);
      if (sessionGeneration() !== epoch || sessionIdentity() !== identity || currentToken() !== token || refreshBlocked()) {
        throw new Error('인증 상태가 변경되었습니다.');
      }
      const session = sessionFromResponse(response.data);
      if (!saveSession(session, epoch)) throw new Error('인증 상태가 변경되었습니다.');
      return session.token;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401 &&
          sessionGeneration() === epoch && sessionIdentity() === identity && currentToken() === token) clearSession();
      throw error;
    }
  });
  refreshFlight = flight;
  void flight.finally(() => { if (refreshFlight === flight) refreshFlight = null; }).catch(() => undefined);
  return flight;
}

type AuthConfig = InternalAxiosRequestConfig & { _authRetried?: boolean; _authEpoch?: number; _authToken?: string; _authBackend?: boolean };
const installedClients = new WeakSet<AxiosInstance>();

export function installAuthInterceptors(client: AxiosInstance) {
  if (installedClients.has(client)) return;
  installedClients.add(client);
  client.interceptors.request.use(config => {
    const request = config as AuthConfig;
    if (request._authRetried && request._authEpoch !== sessionGeneration()) {
      throw new axios.CanceledError('인증 상태가 변경되었습니다.');
    }
    const target = backendRequestUrl(client.getUri(config));
    request.headers = AxiosHeaders.from(request.headers);
    if (!target) {
      request.headers.delete('Authorization');
      request.withCredentials = false;
      request._authBackend = false;
      return request;
    }
    request.url = target;
    request.baseURL = undefined;
    request.params = undefined;
    request.withCredentials = true;
    request._authBackend = true;
    request._authEpoch = sessionGeneration();
    request._authToken = currentToken();
    if (request._authToken && !isAuthEndpoint(target)) request.headers.set('Authorization', `Bearer ${request._authToken}`);
    else request.headers.delete('Authorization');
    return request;
  });
  client.interceptors.response.use(response => response, async error => {
    const request = error.config as AuthConfig | undefined;
    if (!request || !request._authBackend || error.response?.status !== 401 || request._authRetried ||
        isAuthEndpoint(request.url || '') || request.signal?.aborted || !request._authToken ||
        request._authEpoch !== sessionGeneration() || !currentToken()) throw error;
    request._authRetried = true;
    if (currentToken() === request._authToken) await refreshAccessToken();
    if (request.signal?.aborted || request._authEpoch !== sessionGeneration() || !currentToken()) throw error;
    return client.request(request);
  });
}

export async function authenticatedFetch(input: string, init?: RequestInit): Promise<Response> {
  const target = backendRequestUrl(input);
  const headers = new Headers(init?.headers);
  const token = currentToken();
  const epoch = sessionGeneration();
  if (target && token && !isAuthEndpoint(target)) headers.set('Authorization', `Bearer ${token}`);
  else headers.delete('Authorization');
  const request = new Request(target || input, { ...init, headers, credentials: target ? 'include' : 'omit' });
  const retry = request.clone();
  const response = await fetch(request);
  if (!target || response.status !== 401 || isAuthEndpoint(target) || !token || request.signal.aborted ||
      epoch !== sessionGeneration() || !currentToken()) return response;
  if (currentToken() === token) await refreshAccessToken();
  if (request.signal.aborted || epoch !== sessionGeneration() || !currentToken()) return response;
  const retryHeaders = new Headers(retry.headers);
  retryHeaders.set('Authorization', `Bearer ${currentToken()}`);
  return fetch(new Request(retry, { headers: retryHeaders }));
}

export async function serverLogout(): Promise<boolean> {
  // Clear first: old refresh responses cannot re-create a logged-out local session.
  clearSession();
  return authOperation(async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await rawClient.post(`${BACKEND_URL}/api/auth/logout`);
        return true;
      } catch {
        // Retry once; the persistent refresh block remains if the server is unavailable.
      }
    }
    return false;
  });
}
