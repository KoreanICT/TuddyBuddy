package kr.co.ictedu.back.member.dto;

import lombok.Getter;
import lombok.Setter;

/** 카카오 가입 요청. 소셜 ID와 본인 회원코드는 서버가 결정합니다. */
@Getter
@Setter
public class KakaoSignupRequest {
    private String signupToken;
    private String verificationToken;
    private String email;
    private String name;
    private String nick;
    private String phone;
    private String referral_code;
    private Boolean termsAgree;
    private Boolean privacyAgree;
    private Boolean marketingAgree;
}
