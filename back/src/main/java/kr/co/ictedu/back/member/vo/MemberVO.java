package kr.co.ictedu.back.member.vo;

import java.sql.Date;

import org.apache.ibatis.type.Alias;

<<<<<<< HEAD
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
=======
import lombok.Getter;
import lombok.Setter;

@Alias("memvo")
@Getter
@Setter
public class MemberVO {
	private Long member_num;          // PK, number(10)
    private String member_email;      // UNIQUE, varchar2(100)
    private String member_pwd;        // NOT NULL, varchar2(100)
    private String member_name;       // varchar2(50)
    private String member_nick;       // UNIQUE, varchar2(75)
    private String member_phone;      // UNIQUE, varchar2(20)
    private String member_type;       // varchar2(20)
    private Date regdate;             // date
    private Long point;               // number(1000)
    private String studentcode;       // NOT NULL, varchar2(100)	
>>>>>>> 04521f4761b39cbf6170dcd01edc3f6805afd963
}
