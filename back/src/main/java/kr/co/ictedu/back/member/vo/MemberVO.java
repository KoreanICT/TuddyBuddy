package kr.co.ictedu.back.member.vo;

import java.sql.Date;

import org.apache.ibatis.type.Alias;

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
}
