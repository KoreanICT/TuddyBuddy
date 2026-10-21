package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.transaction.support.SimpleTransactionStatus;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.dto.SignupRequest;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.point.service.PointService;

/** 외부 DB·Redis 없이 회원가입과 추천인 보상 연결을 검증합니다. */
@ExtendWith(MockitoExtension.class)
class ReferralSignupUnitTest {
    @Mock MemberDAO members;
    @Mock PasswordEncoder encoder;
    @Mock PointService points;
    @InjectMocks MemberService service;

    private MemberVO newMember() {
        MemberVO member = new MemberVO();
        member.setMember_email("new@example.invalid");
        member.setMember_pwd("test-only-password");
        member.setMember_nick("새회원");
        return member;
    }

    @Test
    void requestSeparatesInputReferralFromGeneratedMemberCode() {
        SignupRequest request = new SignupRequest();
        request.setMember_email("new@example.invalid");
        request.setReferral_code("referrer-code");
        MemberVO member = request.toMember();
        assertEquals("referrer-code", request.getReferral_code());
        assertNull(member.getMember_code());
        assertNull(member.getAuthority());
        assertNull(member.getPoint());
    }

    @Test
    void localSignupRewardsInputReferrerRatherThanNewMember() {
        when(members.findByMemberCode("referrer-code")).thenReturn(new MemberVO());
        when(encoder.encode(anyString())).thenReturn("encoded");
        MemberVO member = newMember();
        service.create(member, "  referrer-code  ");
        verify(members).insertMember(member);
        verify(points).addReferralReward("referrer-code", "회원가입 추천인 보상");
        assertNotNull(member.getMember_code());
        assertNotEquals("referrer-code", member.getMember_code());
    }

    @Test
    void blankReferralDoesNotUseNewMemberCodeForReward() {
        when(encoder.encode(anyString())).thenReturn("encoded");
        service.create(newMember(), "  ");
        verify(members, never()).findByMemberCode(anyString());
        verify(points).addReferralReward(isNull(), eq("회원가입 추천인 보상"));
    }

    @Test
    void invalidReferralStopsBeforeMemberInsert() {
        assertThrows(IllegalArgumentException.class, () -> service.create(newMember(), "invalid"));
        verify(members, never()).insertMember(any());
        verifyNoInteractions(points, encoder);
    }

    @Test
    void kakaoSignupAlsoPassesInputReferrer() {
        MemberVO saved = newMember();
        when(members.findByMemberCode("referrer-code")).thenReturn(new MemberVO());
        when(members.findBySocialLogin("KAKAO", "social-test-id")).thenReturn(null, saved);
        when(encoder.encode(anyString())).thenReturn("encoded");
        assertSame(saved, service.createKakaoMember("social-test-id", "new@example.invalid",
                "테스트", "새회원", "01000000000", "referrer-code"));
        verify(members).insertKakaoMember(any());
        verify(points).addReferralReward("referrer-code", "회원가입 추천인 보상");
    }

    @Test
    void rewardFailureRollsBackSignupTransaction() {
        when(members.findByMemberCode("referrer-code")).thenReturn(new MemberVO());
        when(encoder.encode(anyString())).thenReturn("encoded");
        doThrow(new IllegalStateException("reward unavailable")).when(points)
                .addReferralReward("referrer-code", "회원가입 추천인 보상");
        PlatformTransactionManager transactions = mock(PlatformTransactionManager.class);
        SimpleTransactionStatus status = new SimpleTransactionStatus();
        when(transactions.getTransaction(any())).thenReturn(status);
        ProxyFactory factory = new ProxyFactory(service);
        factory.addAdvice(new TransactionInterceptor(transactions, new AnnotationTransactionAttributeSource()));
        MemberService transactional = (MemberService) factory.getProxy();
        assertThrows(IllegalStateException.class, () -> transactional.create(newMember(), "referrer-code"));
        verify(members).insertMember(any());
        verify(transactions).rollback(status);
        verify(transactions, never()).commit(any());
    }
}
