package kr.co.ictedu.back.group.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("tdlRequestdto")
@Getter
@Setter
public class TdlRequestDTO {
	private Long tdl_num;
	private String member_nick;
	private String tdl_name;
	private String tdl_detail;
	private String status;
	private String repeat_type;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	private LocalDateTime completed_at;
	private LocalDateTime due_at;
	private int can_manage; 
}
