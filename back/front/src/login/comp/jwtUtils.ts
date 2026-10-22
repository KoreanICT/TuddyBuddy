import { isMemberRole, MemberRole } from '../auth/roles';

export interface JwtPayload {
  sub: string;
  role: MemberRole;
  exp: number;
}

export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const json = decodeURIComponent(Array.from(atob(padded), character =>
      '%' + character.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
    const decoded: unknown = JSON.parse(json);
    if (typeof decoded !== 'object' || decoded === null || Array.isArray(decoded)) return null;
    const value = decoded as Record<string, unknown>;
    if (typeof value.sub !== 'string' || !value.sub.trim() || !isMemberRole(value.role)
        || typeof value.exp !== 'number' || !Number.isFinite(value.exp)) return null;
    return { sub: value.sub, role: value.role, exp: value.exp };
  } catch {
    return null;
  }
};
