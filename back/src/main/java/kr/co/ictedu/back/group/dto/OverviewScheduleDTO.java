package kr.co.ictedu.back.group.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("overviewscheduledto")
@Getter
@Setter
public class OverviewScheduleDTO {

	private Long schedule_num;
	private String schedule_name;
	private LocalDateTime schedule_date;
	private LocalDate start_at;
}
