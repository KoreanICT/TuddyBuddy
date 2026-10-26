//최솔
package kr.co.ictedu.back.selfstudy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "QuizGenerateResponseDto 데이터")
public record QuizGenerateResponseDto(
		@Schema(description = "원본 이미지 SHA-256") String imageHash,
		@Schema(description = "기존 세션 분류 재사용 여부") boolean cached,
		@Schema(description = "문제 생성 세션 번호", example = "1") Long quizSessionId,
		@Schema(description = "분류된 카테고리 번호") Long categoryId,
		@Schema(description = "분류된 카테고리명", example = "프로그래밍") String categoryName,
		@Schema(description = "분류된 과목 번호") Long subjectId,
		@Schema(description = "분류된 과목명", example = "자바") String subjectName,
		@Schema(description = "생성된 문제 목록") List<QuizItem> quizzes) {
	@Schema(description = "QuizItem 데이터")
	public record QuizItem(@Schema(description = "문제 번호", example = "1") Long quizId,
			@Schema(description = "문제 생성 세션 번호", example = "1") Long quizSessionId,
			@Schema(description = "문제 내용", example = "자바에서 상속에 사용하는 키워드는?") String quizQuestion,
			@Schema(description = "문제 선택지") List<String> quizSelections,
			@Schema(description = "문제 정답", example = "extends") String quizCorrectAnswer,
			@Schema(description = "정답 해설", example = "extends 키워드는 클래스 상속에 사용됩니다.") String quizExplanation) {
	}
}
