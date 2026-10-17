export type MemberRole = 'ADMIN' | 'SUB_ADMIN' | 'MEMBER';

export const ROLE_LABELS: Record<MemberRole, string> = {
  ADMIN: '최고 관리자',
  SUB_ADMIN: '부관리자',
  MEMBER: '일반 회원'
};

export const ADMIN_ROLES: MemberRole[] = ['ADMIN', 'SUB_ADMIN'];
export const isMemberRole = (role: unknown): role is MemberRole =>
  role === 'ADMIN' || role === 'SUB_ADMIN' || role === 'MEMBER';
export const isAdminRole = (role: unknown): boolean =>
  role === 'ADMIN' || role === 'SUB_ADMIN';
