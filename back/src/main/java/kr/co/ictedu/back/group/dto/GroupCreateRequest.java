//작성자 : 오진석
package kr.co.ictedu.back.group.dto;

import java.util.ArrayList;
import java.util.List;

import org.apache.ibatis.type.Alias;

import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;
import lombok.Getter;
import lombok.Setter;

@Alias("groupcreaterequest")
@Getter
@Setter
public class GroupCreateRequest {
	private GroupVO group;
	private List<TagVO> tags = new ArrayList<>();
	//private Long member_num;
}
