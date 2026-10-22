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
@ToString
@Alias("quizSessionVO")
@Schema(description = "QuizSessionVO 데이터")
public class QuizSessionVO {

    @Schema(description = "문제 생성 세션 번호", example = "1")
    private Long quiz_session_id;
    @Schema(description = "과목 번호", example = "1")
    private Long subject_id;
    @Schema(description = "회원 번호", example = "1")
    private Long member_num;
    @Schema(description = "문제 생성에 사용된 이미지 경로", example = "/images/quiz.png")
    private String quiz_image_url;
    @Schema(description = "문제 유형", example = "객관식")
    private String quiz_type;
    @Schema(description = "문제 난이도", example = "중")
    private String quiz_difficulty;
    @Schema(description = "생성할 문제 수", example = "5")
    private Integer quiz_count;
    @Schema(description = "문제 생성 추가 요청사항", example = "자바 기초 개념을 중심으로 출제해주세요")
    private String quiz_prompt;
    @Schema(description = "생성 일시", example = "2026-10-14T10:00:00")
    private LocalDateTime created_at;
}