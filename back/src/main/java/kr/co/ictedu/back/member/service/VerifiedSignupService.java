package kr.co.ictedu.back.member.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.member.dto.SignupRequest;
import kr.co.ictedu.back.member.vo.MemberVO;

/** HTTP 일반 가입은 반드시 이 경로에서 인증 증명을 소비한 뒤 저장합니다. */
@Service
public class VerifiedSignupService {
    private final SignupEmailVerificationService verification;
    private final MemberService members;

    public VerifiedSignupService(SignupEmailVerificationService verification, MemberService members) {
        this.verification = verification;
        this.members = members;
    }

    @Transactional
    public void signup(SignupRequest request) {
        MemberVO member = request.toMember();
        member.setMember_email(SignupEmailVerificationService.normalizeEmail(request.getMember_email()));
        String referral = members.validateReferralCode(request.getReferral_code());
        verification.consume(request.getVerificationToken(), member.getMember_email());
        // Redis 증명은 일회성입니다. DB 실패로 롤백되어도 재발급하지 않으며 재인증이 필요합니다.
        members.create(member, referral);
    }
}
