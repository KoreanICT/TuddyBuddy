package kr.co.ictedu.back.group.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("groupmembervo")
@Getter
@Setter
public class GroupMemberVO {

	private Long group_num;
	private Long member_num;
	private int is_leader;
	
}
