// 허승표

package kr.co.ictedu.back.activity.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActivityLogSearchRequest {

	private Long memberNum;
	private String category;
	private String result;
	
	// 프론트의 YYYY-MM-DD 문자열을 localDate로 변환합니다.
	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate startDate;
	
	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate endDate;
	
	private int cPage = 1;
}
