//작성자 : 오진석
package kr.co.ictedu.back.group.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DiagramDTO {

	private Long group_num;
	private String title;
	private String diagram_data;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
}
