//작성자 : 오진석
package kr.co.ictedu.back.group.dto;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("grouptagdto")
@Getter
@Setter
public class GroupTagDTO {
	private Long group_num;
	private Long tag_num;
	private String tag_name;
	private String tag_color;
}
