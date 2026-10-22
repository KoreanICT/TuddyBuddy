package kr.co.ictedu.back.group.dto;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("overviewtdldto")
@Getter
@Setter
public class OverviewTdlDTO {

	private Long tdl_num;
	private String tdl_name;
	private String status;
	private LocalDateTime due_at;
}
