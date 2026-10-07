package kr.co.ictedu.back.group.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("tagvo")
@Getter
@Setter
public class TagVO {
	private Long tag_num;
	private String tag_name;
	private String tag_color;
}
