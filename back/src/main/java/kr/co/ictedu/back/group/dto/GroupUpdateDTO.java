package kr.co.ictedu.back.group.dto;

import java.util.ArrayList;
import java.util.List;

import kr.co.ictedu.back.group.vo.TagVO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupUpdateDTO {

	private String group_invitecode;
	private String group_title;
	private String group_desc;
	private String group_thumbnail;
	private List<TagVO> tags = new ArrayList<>();
}
