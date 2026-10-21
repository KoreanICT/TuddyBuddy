// 허승표


package kr.co.ictedu.back.activity.vo;

import java.time.OffsetDateTime;

import org.apache.ibatis.type.Alias;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Alias("alvo")
@Getter
@Setter
@Schema(name = "ActivityLog", description = "회원의 카테고리별 기능 실행 성공,실패 기록")
public class ActivityLogVO {

	@Schema(description = "로그 고유 번호, DB 시퀀스로 생성", example = "1001", accessMode = Schema.AccessMode.READ_ONLY)
	private Long activity_log_num;
	
	@Schema(description = "기능을 실행한 회원번호, 서버 인증 정보에서 확인", example = "25")
	private Long member_num;
	
	// 시간대 정보를 포함하는 날짜 타입
	@Schema(description = "기능 실행 결과가 확인된 시각, 시간대 포함", type = "string", format = "date-time", example = "2026-10-19T14:30:12+09:00")
	private OffsetDateTime activity_occurred_at;
	
	@Schema(description = "기능 카테고리, Group, SelfStudy, ChatBot 등", example = "SelfStudy", maxLength = 40)
	private String activity_category;
	
	@Schema(description = "실행한 기능 코드, Group_join, Quiz_submit 등", example = "Quiz_submit", maxLength = 60)
	private String activity_action;
	
	@Schema(description = "기능 실행 결과", example = "SUCCESS", allowableValues = {"SUCCESS", "FAILURE"}, maxLength = 20)
	private String activity_result;
}
