package kr.co.ictedu.back.selfstudy.dto;
import java.util.List;
public record QuizGenerateResponseDto(Long quizSessionId, List<QuizItem> quizzes) {
    public record QuizItem(Long quizId, Long quizSessionId, String quizQuestion,
            List<String> quizSelections, String quizCorrectAnswer, String quizExplanation) {}
}
