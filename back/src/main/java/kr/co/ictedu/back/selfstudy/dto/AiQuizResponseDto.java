package kr.co.ictedu.back.selfstudy.dto;
import java.util.List;
public record AiQuizResponseDto(List<AiQuiz> quizzes) {
    public record AiQuiz(String quizQuestion, List<String> quizSelections,
                         String quizCorrectAnswer, String quizExplanation) {}
}
