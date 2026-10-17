package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.support.CoreCrudFixtures;

@SpringBootTest
@Transactional
class MemberCrudTest {
    @Autowired MemberDAO dao;

    @Test
    void createReadUpdateGradeAndDeleteLocalMember() {
        MemberVO input = memberInput();
        assertEquals(0, dao.countByEmail(input.getMember_email()));
        dao.insertMember(input);
        MemberVO stored = dao.getMemberByEmail(input.getMember_email());
        Long id = stored.getMember_num();
        assertEquals(input.getMember_nick(), stored.getMember_nick());
        assertEquals(input.getMember_name(), stored.getMember_name());
        assertEquals(input.getMember_pwd(), stored.getMember_pwd());
        assertEquals(input.getMember_phone(), stored.getMember_phone());
        assertEquals("MEMBER", stored.getAuthority());
        assertEquals("LOCAL", stored.getMember_login_type());
        assertEquals(0, stored.getPoint());
        assertEquals(1, dao.countByEmail(input.getMember_email()));
        assertEquals(1, dao.checkEmail(input.getMember_email()));
        assertEquals(1, dao.countByNick(input.getMember_nick()));
        assertEquals(id, dao.findByMemberCode(input.getMember_code()).getMember_num());
        assertTrue(dao.getMemberProfile(id).containsValue(input.getMember_nick()));
        Map<String, String> page = Map.of("searchType", "2", "searchValue", input.getMember_email(),
                "begin", "1", "end", "10");
        assertEquals(1, dao.totalCount(page));
        assertEquals(id, dao.memberList(page).getFirst().getMember_num());

        input.setMember_nick("u" + CoreCrudFixtures.marker().substring(0, 16));
        input.setMember_phone("01000000001");
        assertEquals(1, dao.updateMember(input));
        assertEquals(input.getMember_nick(), dao.getMemberByEmail(input.getMember_email()).getMember_nick());
        assertEquals("01000000001", dao.getMemberByEmail(input.getMember_email()).getMember_phone());
        assertEquals(1, dao.updateGrade(Map.of("authority", "ADMIN", "memberNums", List.of(id))));
        assertEquals("ADMIN", dao.getMemberByEmail(input.getMember_email()).getAuthority());
        assertEquals(1, dao.deleteMember(id));
        assertNull(dao.getMemberByEmail(input.getMember_email()));
        assertEquals(0, dao.countByEmail(input.getMember_email()));
    }

    @Test
    void createAndReadKakaoMemberWithoutExternalLogin() {
        MemberVO input = memberInput();
        input.setMember_social_id(CoreCrudFixtures.marker());
        dao.insertKakaoMember(input);
        MemberVO stored = dao.findBySocialLogin("KAKAO", input.getMember_social_id());
        assertEquals(input.getMember_email(), stored.getMember_email());
        assertEquals("KAKAO", stored.getMember_login_type());
        assertEquals("MEMBER", stored.getAuthority());
        assertEquals(input.getMember_social_id(), stored.getMember_social_id());
        assertEquals(1, dao.deleteMember(stored.getMember_num()));
        assertNull(dao.findBySocialLogin("KAKAO", input.getMember_social_id()));
    }

    private MemberVO memberInput() {
        String marker = CoreCrudFixtures.marker();
        MemberVO input = new MemberVO();
        input.setMember_email(marker + "@example.invalid");
        input.setMember_pwd("synthetic-password-hash");
        input.setMember_name("CRUD fixture");
        input.setMember_nick("t" + marker.substring(0, 16));
        input.setMember_phone("01000000000");
        input.setMember_code(marker);
        input.setAuthority("MEMBER");
        return input;
    }
}
