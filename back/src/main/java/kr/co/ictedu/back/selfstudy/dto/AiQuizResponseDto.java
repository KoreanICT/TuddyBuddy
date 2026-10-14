//최솔
package kr.co.ictedu.back.selfstudy.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
@Schema(description = "AiQuizResponseDto 데이터")
public record AiQuizResponseDto(@Schema(description = "생성된 문제 목록") List<AiQuiz> quizzes) {
    @Schema(description = "AiQuiz 데이터")
    public record AiQuiz(@Schema(description = "문제 내용", example = "자바에서 상속에 사용하는 키워드는?") String quizQuestion, @Schema(description = "문제 선택지") List<String> quizSelections,
                         @Schema(description = "문제 정답", example = "extends") String quizCorrectAnswer, @Schema(description = "정답 해설", example = "extends 키워드는 클래스 상속에 사용됩니다.") String quizExplanation) {}
}
