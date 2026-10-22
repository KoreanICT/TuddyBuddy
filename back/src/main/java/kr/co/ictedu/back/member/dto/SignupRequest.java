package kr.co.ictedu.back.member.dto;

import kr.co.ictedu.back.member.vo.MemberVO;
import lombok.Getter;
import lombok.Setter;

/** 일반 가입 입력값. 본인 회원코드·권한·잔액은 요청에서 받지 않습니다. */
@Getter
@Setter
public class SignupRequest {
    private String member_email;
    private String member_pwd;
    private String member_name;
    private String member_nick;
    private String member_phone;
    // 기존 추천인의 코드이며, 신규 회원에게 발급할 member_code와 다릅니다.
    private String referral_code;
    private String verificationToken;

    public MemberVO toMember() {
        MemberVO member = new MemberVO();
        member.setMember_email(member_email);
        member.setMember_pwd(member_pwd);
        member.setMember_name(member_name);
        member.setMember_nick(member_nick);
        member.setMember_phone(member_phone);
        return member;
    }
}
