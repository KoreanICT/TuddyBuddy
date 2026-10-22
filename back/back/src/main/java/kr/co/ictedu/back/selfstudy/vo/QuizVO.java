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
@Alias("quizVO")
@ToString
@Schema(description = "QuizVO 데이터")
public class QuizVO {

    @Schema(description = "문제 번호", example = "1")
    private Long quiz_id;
    @Schema(description = "문제 생성 세션 번호", example = "1")
    private Long quiz_session_id;
    @Schema(description = "문제 내용", example = "자바에서 상속에 사용하는 키워드는?")
    private String quiz_question;
    @Schema(description = "문제 선택지", example = "[\"extends\", \"implements\", \"import\", \"package\"]")
    private String quiz_selections ;
    @Schema(description = "문제 정답", example = "extends")
    private String quiz_correct_answer;
    @Schema(description = "정답 해설", example = "extends 키워드는 클래스 상속에 사용됩니다.")
    private String quiz_explanation;
    @Schema(description = "생성 일시", example = "2026-10-14T10:00:00")
    private LocalDateTime created_at;
    
}