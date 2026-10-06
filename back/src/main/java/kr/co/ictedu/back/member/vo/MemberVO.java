package kr.co.ictedu.back.member.vo;

import java.sql.Date;

import org.apache.ibatis.type.Alias;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Alias("mvo")
public class MemberVO {

    // 회원 번호
    private Long member_num;

    // 회원 이메일
    private String member_email;

    // 회원 비밀번호
    private String member_pwd;

    // 회원 이름
    private String member_name;

    // 회원 닉네임
    private String member_nick;

    // 회원 전화번호
    private String member_phone;

    // 권한
    private String authority;

    // 가입일
    private Date regdate;

    // 회원 코드
    private String member_code;

    // 포인트
    private Integer point;

    // 로그인 타입
    // 예: LOCAL, KAKAO
    private String member_login_type;

    // 소셜 로그인 ID
    private String member_social_id;
}
