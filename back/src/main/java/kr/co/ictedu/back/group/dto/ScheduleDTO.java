package kr.co.ictedu.back.group.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("scheduledto")
@Getter
@Setter
public class ScheduleDTO {
	
	private Long schedule_num;
	private String member_nick;
	private String schedule_name;
	private LocalDateTime schedule_date;
	private String schedule_detail;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	private LocalDate start_at;
	private LocalDate end_at;
	private int can_manage; 
}
