const REDIRECT_KEY = 'tuddy_login_redirect';

export const getLoginDestination = (value: string | null): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes(String.fromCharCode(92))) return '/';
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || ['/auth/member', '/auth/signup'].includes(url.pathname.toLowerCase())
      || url.pathname.toLowerCase().startsWith('/auth/kakao/')) return '/';
    return url.pathname + url.search + url.hash;
  } catch {
    return '/';
  }
};

export const rememberLoginDestination = (value: string | null) => {
  sessionStorage.setItem(REDIRECT_KEY, getLoginDestination(value));
};

export const consumeLoginDestination = (): string => {
  const destination = getLoginDestination(sessionStorage.getItem(REDIRECT_KEY));
  sessionStorage.removeItem(REDIRECT_KEY);
  return destination;
};
