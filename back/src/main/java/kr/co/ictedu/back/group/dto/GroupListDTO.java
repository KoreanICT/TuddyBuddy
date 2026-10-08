package kr.co.ictedu.back.group.dto;

import java.util.ArrayList;
import java.util.List;

import org.apache.ibatis.type.Alias;

import kr.co.ictedu.back.group.vo.TagVO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupListDTO {
	private Long group_num;
	private String group_title;
	private String group_desc;
	private int group_isPrivate;
	private int group_maxMembers;
	private String group_thumbnail;
	private int current_members;
	private int is_leader;
	private List<TagVO> tags = new ArrayList<>();
}
