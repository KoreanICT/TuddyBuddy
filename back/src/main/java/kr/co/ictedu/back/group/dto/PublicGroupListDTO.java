package kr.co.ictedu.back.group.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import kr.co.ictedu.back.group.vo.TagVO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublicGroupListDTO {
	
	private Long group_num;
	private String group_title;
	private String group_desc;
	private int group_maxMembers;
	private String group_thumbnail;
	private LocalDateTime created_at;
	private int current_members;
	private List<TagVO> tags = new ArrayList<>();
}
