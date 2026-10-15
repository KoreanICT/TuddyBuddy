package kr.co.ictedu.back.group.dto;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("memberdatadto")
@Getter
@Setter
public class MemberDataDTO {
	private Long member_num;
	private String member_nick;
	private String member_name;
	private int is_leader;
}
