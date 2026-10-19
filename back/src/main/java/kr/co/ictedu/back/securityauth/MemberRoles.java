package kr.co.ictedu.back.securityauth;

public final class MemberRoles {
    public static final String ADMIN = "ADMIN";
    public static final String SUB_ADMIN = "SUB_ADMIN";
    public static final String MEMBER = "MEMBER";

    private MemberRoles() { }

    public static boolean isManager(String authority) {
        return ADMIN.equals(authority) || SUB_ADMIN.equals(authority);
    }
}
