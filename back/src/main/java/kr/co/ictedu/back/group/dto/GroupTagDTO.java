package kr.co.ictedu.back.group.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupTagDTO {
	private Long group_num;
	private Long tag_num;
	private String tag_name;
	private String tag_color;
}
