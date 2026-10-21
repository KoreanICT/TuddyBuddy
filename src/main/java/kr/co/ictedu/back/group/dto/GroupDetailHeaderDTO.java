//작성자 : 오진석
package kr.co.ictedu.back.group.dto;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("groupdetailheaderdto")
@Getter
@Setter
public class GroupDetailHeaderDTO {

	private String group_title;
	private String group_desc;
	private String group_thumbnail;
	private int is_leader;
}
