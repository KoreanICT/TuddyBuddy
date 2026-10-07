package kr.co.ictedu.back.group.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("diagramvo")
@Getter
@Setter
public class DiagramVO {
	
	private Long diagram_num;
	private Long group_num;
	private String title;
	private String diagram_data;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	
}
