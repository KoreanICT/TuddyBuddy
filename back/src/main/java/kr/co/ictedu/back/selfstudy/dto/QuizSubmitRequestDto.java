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
@Schema(description = "QuizSubmitRequestDto 데이터")
public class QuizSubmitRequestDto {

    @Schema(description = "문제 생성 세션 번호", example = "1")
    private Long quiz_sessionid;
    @Schema(description = "과목 번호", example = "1")
    private Long subject_id;
    @Schema(description = "회원 번호", example = "1")
    private Long member_num;
    @Schema(description = "문제 풀이에 걸린 시간(초)", example = "742")
    private Long quiz_time_seconds;

    @Schema(description = "사용자 문제 답변 목록")
    private List<QuizResponseDto> responses;
}
