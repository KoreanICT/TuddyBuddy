package kr.co.ictedu.back.group.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("groupvo")
@Setter
@Getter
public class GroupVO {
	
	private Long group_num;
	private String group_title;
	private String group_desc;
	private String group_isPrivate;
	private int group_maxMembers;
	private String group_thumbnail;
	private String group_invitecode;
	private LocalDateTime created_at;
	
}
