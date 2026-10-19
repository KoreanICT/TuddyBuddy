export type MemberRole = 'ADMIN' | 'SUB_ADMIN' | 'MEMBER';

export const ROLE_LABELS: Record<MemberRole, string> = {
  ADMIN: '최고 관리자',
  SUB_ADMIN: '부관리자',
  MEMBER: '일반 회원'
};

export const ADMIN_ROLES: MemberRole[] = ['ADMIN', 'SUB_ADMIN'];
// 메뉴 표시와 페이지 접근에 동일한 권한 기준을 사용합니다.
export const ROLE_ACCESS: Record<'member' | 'admin' | 'manageMemberRole' | 'withdrawMember' | 'manageSelfStudy', MemberRole[]> = {
  member: ['MEMBER', 'ADMIN', 'SUB_ADMIN'],
  admin: ADMIN_ROLES,
  manageMemberRole: ['ADMIN'],
  withdrawMember: ['ADMIN'],
  manageSelfStudy: ['ADMIN']
};
export const isMemberRole = (role: unknown): role is MemberRole =>
  role === 'ADMIN' || role === 'SUB_ADMIN' || role === 'MEMBER';
export const isAdminRole = (role: unknown): boolean =>
  role === 'ADMIN' || role === 'SUB_ADMIN';
