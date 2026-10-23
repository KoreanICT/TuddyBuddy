package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import kr.co.ictedu.back.member.controller.MailCertiController;
import kr.co.ictedu.back.member.service.EmailSender;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.service.SignupEmailVerificationService;
import kr.co.ictedu.back.member.vo.EmailCheckVO;
import kr.co.ictedu.back.member.vo.EmailCountCheckVO;

@ExtendWith(MockitoExtension.class)
class MailCertiControllerTest {
    @InjectMocks MailCertiController controller;
    @Mock EmailSender emailSender;
    @Mock MemberService memberService;
    @Mock SignupEmailVerificationService signupVerification;
    private final String email = "member@example.invalid";
    private final String code = "ABC123";

    @Test
    void sendNormalizesEmailBeforeSending() {
        when(emailSender.duplicateEmail(email)).thenReturn(0);
        assertEquals(0, controller.sendEmail(new EmailCheckVO(" Member@Example.Invalid ", null)));
        verify(emailSender).sendEmail(email);
    }

    @Test
    void duplicateDoesNotSendMail() {
        when(emailSender.duplicateEmail(email)).thenReturn(1);
        assertEquals(1, controller.sendEmail(new EmailCheckVO(email, null)));
        verify(emailSender, never()).sendEmail(anyString());
    }

    @Test
    void verifySuccessIncludesProof() {
        when(signupVerification.verifyCode(email, code)).thenReturn(new EmailCountCheckVO(true, "ok", "proof"));
        var result = controller.verifyCertificationNumber(new EmailCheckVO(email, code)).getBody();
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("proof", result.getVerificationToken());
    }

    @Test
    void verifyWrongCode() { assertFailure("wrong"); }

    @Test
    void verifyExpiredCode() { assertFailure("expired"); }

    @Test
    void verifyExceededAttempts() { assertFailure("exceeded"); }

    private void assertFailure(String reason) {
        when(signupVerification.verifyCode(email, code)).thenReturn(new EmailCountCheckVO(false, reason));
        var result = controller.verifyCertificationNumber(new EmailCheckVO(email, code)).getBody();
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertEquals(reason, result.getReason());
        assertNull(result.getVerificationToken());
    }
}