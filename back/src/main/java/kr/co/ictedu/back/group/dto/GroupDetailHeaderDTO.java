package kr.co.ictedu.back.group.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupDetailHeaderDTO {

	private String group_title;
	private String group_desc;
	private String group_thumbnail;
	private int is_leader;
}
