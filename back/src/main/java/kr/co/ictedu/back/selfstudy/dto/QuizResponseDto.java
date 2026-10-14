//최솔
package kr.co.ictedu.back.selfstudy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Schema(description = "QuizResponseDto 데이터")
public class QuizResponseDto {

	@Schema(description = "문제 번호", example = "1")
	private Long quiz_id;
	 @Schema(description = "사용자가 제출한 답변", example = "extends")
	 private String quiz_user_response;
}