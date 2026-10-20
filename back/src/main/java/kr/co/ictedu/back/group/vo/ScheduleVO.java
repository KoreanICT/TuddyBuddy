package kr.co.ictedu.back.group.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("schedulevo")
@Getter
@Setter
public class ScheduleVO {

	private Long schedule_num;
	private Long group_num;
	private Long member_num;
	private String schedule_name;
	private LocalDate schedule_date;
	private String schedule_detail;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	private LocalDateTime start_at;
	private LocalDateTime end_at;
}
