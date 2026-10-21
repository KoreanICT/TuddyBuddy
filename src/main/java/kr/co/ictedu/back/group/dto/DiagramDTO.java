//작성자 : 오진석
package kr.co.ictedu.back.group.dto;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("diagramdto")
@Getter
@Setter
public class DiagramDTO {

	private Long group_num;
	private String title;
	private String diagram_data;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
}
