package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;

@SpringBootTest
public class MemberSignupTest {

    @Value("${test.member.email}")
    private String loginEmail;

    @Value("${test.member.password}")
    private String password;

    @Value("${test.member.nick}")
    private String nick;

    @Value("${test.member.name}")
    private String name;

    @Value("${test.member.phone}")
    private String phone;

    @Autowired
    private MemberService memberService;

    @Autowired
    private MemberDAO memberDAO;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PlatformTransactionManager transactionManager;

    // 수동 실행용: 모든 검증에 성공하면 로그인용 더미 회원을 실제 DB에 유지합니다.
    // 더미 회원 정보는 application.properties의 test.member 설정에서 읽습니다.
    @Test
    void signupRealDBTest() {
        assertTrue(loginEmail != null && !loginEmail.isBlank(), "더미 이메일 설정이 필요합니다.");
        assertTrue(password != null && !password.isBlank(), "더미 비밀번호 설정이 필요합니다.");
        assertTrue(nick != null && !nick.isBlank(), "더미 닉네임 설정이 필요합니다.");
        assertTrue(name != null && !name.isBlank(), "더미 이름 설정이 필요합니다.");
        assertTrue(phone != null && !phone.isBlank(), "더미 전화번호 설정이 필요합니다.");

        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            MemberVO saved = memberDAO.getMemberByEmail(loginEmail);
            if (saved == null) {
                assertEquals(0, memberDAO.countByNick(nick),
                        "더미 닉네임이 이미 사용 중입니다. 기존 회원은 변경하지 않습니다.");

                MemberVO fixture = new MemberVO();
                fixture.setMember_email(loginEmail);
                fixture.setMember_pwd(password);
                fixture.setMember_name(name);
                fixture.setMember_nick(nick);
                fixture.setMember_phone(phone);
                fixture.setMember_login_type("LOCAL");
                memberService.create(fixture);
                saved = memberDAO.getMemberByEmail(loginEmail);
            }

            assertNotNull(saved, "더미 회원 저장 후 조회에 실패했습니다.");
            // 동일 이메일의 다른 계정은 재사용하거나 초기화하지 않습니다.
            assertTrue(name.equals(saved.getMember_name())
                            && nick.equals(saved.getMember_nick()),
                    "기존 계정이 이 테스트의 더미 회원이 아닙니다. 기존 회원은 변경하지 않습니다.");
            assertNotNull(saved.getMember_num(), "회원 번호가 생성되지 않았습니다.");
            assertTrue(loginEmail.equals(saved.getMember_email()), "더미 이메일이 일치하지 않습니다.");
            assertTrue("MEMBER".equals(saved.getAuthority()), "더미 회원 권한이 MEMBER가 아닙니다.");
            assertTrue("LOCAL".equals(saved.getMember_login_type()), "더미 회원이 일반 로그인 계정이 아닙니다.");
            assertTrue(saved.getMember_pwd() != null && saved.getMember_pwd().startsWith("$2"),
                    "저장된 비밀번호가 BCrypt 형식이 아닙니다.");
            assertTrue(passwordEncoder.matches(password, saved.getMember_pwd()),
                    "기존 더미 회원의 비밀번호가 테스트 비밀번호와 다릅니다. 기존 계정은 변경하지 않습니다.");
            assertEquals(1, memberDAO.countByEmail(loginEmail), "더미 이메일 중복 상태를 확인해주세요.");
            assertEquals(1, memberDAO.countByNick(nick), "더미 닉네임 중복 상태를 확인해주세요.");
        });

        System.out.println("로그인용 더미 회원 준비 및 검증을 완료했습니다.");
    }
}
