//최솔
package kr.co.ictedu.back.selfstudy.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Alias("quizResponseVO")
@ToString
@Schema(description = "QuizResponseVO 데이터")
public class QuizResponseVO {

    @Schema(description = "문제 응답 번호", example = "1")
    private Long quiz_responses_id;
    @Schema(description = "셀프스터디 결과 번호", example = "1")
    private Long selfstudy_results_id;
    @Schema(description = "문제 번호", example = "1")
    private Long quiz_id;
    @Schema(description = "사용자가 제출한 답변", example = "extends")
    private String quiz_user_response;
    @Schema(description = "정답 여부", example = "Y")
    private String quiz_correct;
    @Schema(description = "제출 일시", example = "2026-10-14T10:30:00")
    private LocalDateTime submitted_at;
}

