//최솔
package kr.co.ictedu.back.selfstudy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
@Schema(description = "QuizGenerateResponseDto 데이터")
public record QuizGenerateResponseDto(@Schema(description = "문제 생성 세션 번호", example = "1") Long quizSessionId, @Schema(description = "생성된 문제 목록") List<QuizItem> quizzes) {
    @Schema(description = "QuizItem 데이터")
    public record QuizItem(@Schema(description = "문제 번호", example = "1") Long quizId, @Schema(description = "문제 생성 세션 번호", example = "1") Long quizSessionId, @Schema(description = "문제 내용", example = "자바에서 상속에 사용하는 키워드는?") String quizQuestion,
            @Schema(description = "문제 선택지") List<String> quizSelections, @Schema(description = "문제 정답", example = "extends") String quizCorrectAnswer, @Schema(description = "정답 해설", example = "extends 키워드는 클래스 상속에 사용됩니다.") String quizExplanation) {}
}
