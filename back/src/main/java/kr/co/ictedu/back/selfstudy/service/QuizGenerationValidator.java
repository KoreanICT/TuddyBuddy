package kr.co.ictedu.back.selfstudy.service;

import java.util.List;

import org.springframework.stereotype.Component;

import kr.co.ictedu.back.selfstudy.exception.QuizGenerationException;

@Component
public class QuizGenerationValidator {

    public void validate(
            List<?> quizzes,
            int requestedCount
    ) {
        if (requestedCount < 1 || requestedCount > 10) {
            throw new QuizGenerationException(
                "문제 개수는 1~10개 사이여야 합니다."
            );
        }

        if (quizzes == null || quizzes.isEmpty()) {
            throw new QuizGenerationException(
                "AI 문제 생성에 실패했습니다. 포인트는 차감되지 않습니다."
            );
        }

        if (quizzes.size() != requestedCount) {
            throw new QuizGenerationException(
                "요청한 문제 개수를 생성하지 못했습니다. "
                + "다시 시도해주세요."
            );
        }
    }
}