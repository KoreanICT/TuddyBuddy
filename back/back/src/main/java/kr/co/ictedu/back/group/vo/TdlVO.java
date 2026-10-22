package kr.co.ictedu.back.group.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("tdlvo")
@Getter
@Setter
public class TdlVO {

	private Long tdl_num;
	private Long group_num;
	private Long member_num;
	private String tdl_name;
	private String tdl_detail;
	private String status;
	private String repeat_type;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	private LocalDateTime completed_at;
	private LocalDateTime due_at;
	
}
