package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.member.controller.MemberController;
import kr.co.ictedu.back.member.dto.SignupRequest;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.service.SignupEmailVerificationService;
import kr.co.ictedu.back.member.service.VerifiedSignupService;
import org.springframework.test.util.ReflectionTestUtils;

class VerifiedSignupUnitTest {
    private final SignupEmailVerificationService verification = mock(SignupEmailVerificationService.class);
    private final MemberService members = mock(MemberService.class);
    private final VerifiedSignupService service = new VerifiedSignupService(verification, members);

    private SignupRequest request() {
        SignupRequest request = new SignupRequest();
        request.setMember_email(" Member@Example.Invalid ");
        request.setVerificationToken("proof");
        return request;
    }

    @Test
    void verifiesBeforeAnyMemberWrite() {
        service.signup(request());
        var order = inOrder(verification, members);
        order.verify(members).validateReferralCode(null);
        order.verify(verification).consume("proof", "member@example.invalid");
        order.verify(members).create(argThat(member -> "member@example.invalid".equals(member.getMember_email())), isNull());
    }

    @Test
    void invalidProofPreventsMemberAndRewardCreation() {
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST)).when(verification).consume(anyString(), anyString());
        assertThrows(ResponseStatusException.class, () -> service.signup(request()));
        verify(members, never()).create(any(), any());
    }

    @Test
    void invalidReferralDoesNotConsumeProof() {
        when(members.validateReferralCode(any())).thenThrow(new IllegalArgumentException("invalid referral"));
        assertThrows(IllegalArgumentException.class, () -> service.signup(request()));
        verifyNoInteractions(verification);
    }

    @Test
    void httpSignupCannotBypassVerificationEntryPoint() {
        MemberController controller = new MemberController();
        ReflectionTestUtils.setField(controller, "verifiedSignup", service);
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST)).when(verification).consume(any(), anyString());
        SignupRequest request = request();
        request.setVerificationToken(null);
        assertThrows(ResponseStatusException.class, () -> controller.memberjoin(request));
        verify(members, never()).create(any(), any());
    }
}
