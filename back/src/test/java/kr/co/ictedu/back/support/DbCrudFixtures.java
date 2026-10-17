package kr.co.ictedu.back.support;

import kr.co.ictedu.back.member.dao.MemberDAO;

/** Test-owned members created and read through the production DAO. */
public final class DbCrudFixtures {
    private DbCrudFixtures() {}

    public static long member(MemberDAO members) {
        return CoreCrudFixtures.member(members, "MEMBER");
    }
}
