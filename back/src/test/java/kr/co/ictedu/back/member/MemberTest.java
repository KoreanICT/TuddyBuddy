package kr.co.ictedu.back.member;


import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;

@SpringBootTest
@Transactional
public class MemberTest {

    @Autowired
    private MemberService memberService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 회원가입 테스트
    @Test
    void signupTest() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String email = "test" + unique + "@test.com";
        String nick = "test" + unique;
        String password = "Test1234!";

        MemberVO vo = new MemberVO();
        vo.setMember_email(email);
        vo.setMember_pwd(password);
        vo.setMember_name("테스트회원");
        vo.setMember_nick(nick);
        vo.setMember_phone("01012345678");
        vo.setMember_code("TEST" + unique);
        vo.setAuthority("MEMBER");

        // 회원가입
        memberService.create(vo);

        // DB에서 회원 조회
        MemberVO result = memberService.getMemberByEmail(email);

        // 회원가입 검증
        assertNotNull(result, "회원가입 후 조회된 회원이 없습니다.");
        assertEquals(email, result.getMember_email());
        assertEquals(nick, result.getMember_nick());
        assertEquals("MEMBER", result.getAuthority());

        // 비밀번호 암호화 검증
        assertNotEquals(password, result.getMember_pwd());
        assertTrue(passwordEncoder.matches(password, result.getMember_pwd()));

        System.out.println("회원가입 테스트 성공");
        System.out.println("이메일 : " + result.getMember_email());
        System.out.println("닉네임 : " + result.getMember_nick());
        System.out.println("권한 : " + result.getAuthority());
        System.out.println("암호화 비밀번호 : " + result.getMember_pwd());
    }

    // 이메일 중복 테스트
    @Test
    void duplicateEmailTest() {
        String unique = UUID.randomUUID().toString().substring(0, 8);

        MemberVO vo = new MemberVO();
        vo.setMember_email("duplicate" + unique + "@test.com");
        vo.setMember_pwd("Test1234!");
        vo.setMember_name("테스트회원");
        vo.setMember_nick("nick" + unique);
        vo.setMember_phone("01012345678");
        vo.setMember_code("TEST" + unique);
        vo.setAuthority("MEMBER");

        memberService.create(vo);

        MemberVO duplicate = new MemberVO();
        duplicate.setMember_email(vo.getMember_email());
        duplicate.setMember_pwd("Test1234!");
        duplicate.setMember_name("중복회원");
        duplicate.setMember_nick("other" + unique);
        duplicate.setMember_phone("01012345678");
        duplicate.setMember_code("DUP" + unique);
        duplicate.setAuthority("MEMBER");

        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> memberService.create(duplicate)
        );

        assertEquals("이미 사용 중인 이메일입니다.", exception.getMessage());

        System.out.println("이메일 중복 테스트 성공");
    }
}

