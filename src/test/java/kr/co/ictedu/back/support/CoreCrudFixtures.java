package kr.co.ictedu.back.support;

import java.util.UUID;
import java.util.List;
import java.util.Map;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.report.dao.ReportDao;
import kr.co.ictedu.back.report.vo.ReportVO;

/** Synthetic prerequisites only; CRUD assertions exercise production DAOs. */
public final class CoreCrudFixtures {
    private CoreCrudFixtures() {}

    public static String marker() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static Long member(MemberDAO dao, String authority) {
        String marker = marker();
        MemberVO input = new MemberVO();
        input.setMember_email(marker + "@example.invalid");
        input.setMember_pwd("synthetic-password-hash");
        input.setMember_name("CRUD fixture");
        input.setMember_nick("t" + marker.substring(0, 16));
        input.setMember_phone("01000000000");
        input.setMember_code(marker);
        input.setAuthority("MEMBER");
        dao.insertMember(input);
        Long id = dao.getMemberByEmail(input.getMember_email()).getMember_num();
        if (!"MEMBER".equals(authority)) {
            dao.updateGrade(Map.of("authority", authority, "memberNums", List.of(id)));
        }
        return id;
    }

    public static Long report(ReportDao dao, Long memberNum) {
        String category = marker();
        ReportVO input = new ReportVO();
        input.setMember_num(memberNum);
        input.setType("report");
        input.setCategory(category);
        input.setContent("synthetic report");
        input.setTarget_num(0L);
        dao.add(input);
        return dao.myList(Map.of("member_num", memberNum.toString(), "begin", "1", "end", "10"))
                .stream().filter(row -> category.equals(row.getCategory())).findFirst().orElseThrow().getNum();
    }
}
