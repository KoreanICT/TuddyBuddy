package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import kr.co.ictedu.back.member.controller.MailCertiController;
import kr.co.ictedu.back.member.dao.CertiNumRedisDao;
import kr.co.ictedu.back.member.service.EmailSender;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.EmailCheckVO;
import kr.co.ictedu.back.member.vo.EmailCountCheckVO;

@ExtendWith(MockitoExtension.class)
public class MailCertiControllerTest {

    @InjectMocks
    private MailCertiController controller;

    @Mock
    private EmailSender emailSender;

    @Mock
    private CertiNumRedisDao certiNumRedisDao;

    @Mock
    private MemberService memberService;

    private String email;
    private String code;

    @BeforeEach
    void setUp() {
        email = "jyh7827@naver.com";
        code = "ABC123";
    }

    // =========================
    // 이메일 중복 없이 인증번호 발송
    // =========================
    @Test
    void sendEmailSuccessTest() {
        when(emailSender.duplicateEmail(email)).thenReturn(0);

        int result = controller.sendEmail(new EmailCheckVO(email, null));

        assertEquals(0, result);
        verify(emailSender).sendEmail(email);

        System.out.println("이메일 인증번호 발송 테스트 성공");
    }

    // =========================
    // 이메일 중복 확인
    // =========================
    @Test
    void duplicateEmailTest() {
        when(emailSender.duplicateEmail(email)).thenReturn(1);

        int result = controller.sendEmail(new EmailCheckVO(email, null));

        assertEquals(1, result);
        verify(emailSender, never()).sendEmail(anyString());

        System.out.println("이메일 중복 테스트 성공");
    }

    // =========================
    // 인증번호 일치
    // =========================
    @Test
    void verifySuccessTest() {
        when(certiNumRedisDao.hasKey(email)).thenReturn(true);
        when(certiNumRedisDao.getAttempt(email)).thenReturn(0);
        when(certiNumRedisDao.getCertiRedisNum(email)).thenReturn(code);

        ResponseEntity<EmailCountCheckVO> response =
                controller.verifyCertificationNumber(new EmailCheckVO(email, code));

        EmailCountCheckVO result = response.getBody();

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("ok", result.getReason());

        verify(certiNumRedisDao).delCertiRedisNum(email);

        System.out.println("이메일 인증 성공 테스트 통과");
    }

    // =========================
    // 인증번호 불일치
    // =========================
    @Test
    void verifyWrongCodeTest() {
        when(certiNumRedisDao.hasKey(email)).thenReturn(true);
        when(certiNumRedisDao.getAttempt(email)).thenReturn(0);
        when(certiNumRedisDao.getCertiRedisNum(email)).thenReturn("WRONG1");

        ResponseEntity<EmailCountCheckVO> response =
                controller.verifyCertificationNumber(new EmailCheckVO(email, code));

        EmailCountCheckVO result = response.getBody();

        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertEquals("wrong", result.getReason());

        verify(certiNumRedisDao).incrAttempt(email);
        verify(certiNumRedisDao, never()).delCertiRedisNum(email);

        System.out.println("인증번호 불일치 테스트 통과");
    }

    // =========================
    // 인증번호 만료
    // =========================
    @Test
    void verifyExpiredTest() {
        when(certiNumRedisDao.hasKey(email)).thenReturn(false);

        ResponseEntity<EmailCountCheckVO> response =
                controller.verifyCertificationNumber(new EmailCheckVO(email, code));

        EmailCountCheckVO result = response.getBody();

        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertEquals("expired", result.getReason());

        verify(certiNumRedisDao, never()).getCertiRedisNum(email);

        System.out.println("인증번호 만료 테스트 통과");
    }

    // =========================
    // 인증 3회 실패 초과
    // =========================
    @Test
    void verifyExceededTest() {
        when(certiNumRedisDao.hasKey(email)).thenReturn(true);
        when(certiNumRedisDao.getAttempt(email)).thenReturn(3);

        ResponseEntity<EmailCountCheckVO> response =
                controller.verifyCertificationNumber(new EmailCheckVO(email, code));

        EmailCountCheckVO result = response.getBody();

        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertEquals("exceeded", result.getReason());

        verify(certiNumRedisDao, never()).getCertiRedisNum(email);
        verify(certiNumRedisDao, never()).incrAttempt(email);

        System.out.println("인증 횟수 초과 테스트 통과");
    }
    
}
