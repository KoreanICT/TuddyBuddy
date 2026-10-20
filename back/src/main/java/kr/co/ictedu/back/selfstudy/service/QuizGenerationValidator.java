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
        validateRequestedCount(requestedCount);

        if (quizzes == null || quizzes.isEmpty()) {
            throw new QuizGenerationException(
                    "AI가 문제를 생성하지 못했습니다. 다시 시도해주세요. 포인트는 차감되지 않았습니다."
            );
        }

        if (quizzes.size() != requestedCount) {
            throw new QuizGenerationException(
                    "AI가 요청한 수만큼 문제를 생성하지 못했습니다. 다시 시도해주세요. 포인트는 차감되지 않았습니다."
            );
        }
    }

    public void validateRequestedCount(int requestedCount) {
        if (requestedCount < 1 || requestedCount > 10) {
            throw new QuizGenerationException(
                    "문제 개수는 1~10개 사이여야 합니다. 포인트는 차감되지 않았습니다."
            );
        }
    }
}
