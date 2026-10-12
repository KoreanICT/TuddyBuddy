
package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;

@SpringBootTest
public class MemberSignupTest {

    @Autowired
    private MemberService memberService;

    @Autowired
    private MemberDAO memberDAO;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =========================
    // 실제 Oracle DB 회원가입 테스트
    // =========================
    @Test
    void signupRealDBTest() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String email = "test" + unique + "@example.com";
        String password = "Test1234!";
        String nick = "tester" + unique;

        // 회원가입 데이터
        MemberVO vo = new MemberVO();
        vo.setMember_email(email);
        vo.setMember_pwd(password);
        vo.setMember_name("테스트회원");
        vo.setMember_nick(nick);
        vo.setMember_phone("01012345678");
        vo.setMember_code("TEST" + unique);
        vo.setAuthority("MEMBER");
        vo.setMember_login_type("LOCAL");

        // 1. 회원가입 전 중복 검사
        assertEquals(0, memberDAO.countByEmail(email));
        assertEquals(0, memberDAO.countByNick(nick));

        // 2. 실제 회원가입
        memberService.create(vo);

        // 3. DB에 저장된 회원 조회
        MemberVO saved = memberDAO.getMemberByEmail(email);

        // 4. 회원정보 검증
        assertNotNull(saved, "회원정보가 DB에 저장되지 않았습니다.");
        assertNotNull(saved.getMember_num());
        assertEquals(email, saved.getMember_email());
        assertEquals("테스트회원", saved.getMember_name());
        assertEquals(nick, saved.getMember_nick());
        assertEquals("MEMBER", saved.getAuthority());
        assertEquals("LOCAL", saved.getMember_login_type());

        // 5. BCrypt 암호화 검증
        assertNotEquals(password, saved.getMember_pwd());
        assertTrue(passwordEncoder.matches(password, saved.getMember_pwd()));

        // 6. 회원가입 후 중복 검사
        assertEquals(1, memberDAO.countByEmail(email));
        assertEquals(1, memberDAO.countByNick(nick));

        System.out.println("==================================");
        System.out.println("실제 Oracle 회원가입 테스트 성공");
        System.out.println("회원번호 : " + saved.getMember_num());
        System.out.println("이메일 : " + saved.getMember_email());
        System.out.println("이름 : " + saved.getMember_name());
        System.out.println("닉네임 : " + saved.getMember_nick());
        System.out.println("권한 : " + saved.getAuthority());
        System.out.println("로그인 타입 : " + saved.getMember_login_type());
        System.out.println("BCrypt 암호화 검증 성공");
        System.out.println("==================================");
    }
}
