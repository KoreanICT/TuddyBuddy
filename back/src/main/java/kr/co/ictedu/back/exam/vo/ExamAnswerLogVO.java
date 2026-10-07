package kr.co.ictedu.back.exam.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamAnswerLogVO {
	
	// PK (DB Column: LOG_ID)
    private Long logId;

    // FK (DB Column: RESULT_ID -> EXAM_RESULT 테이블 참조)
    private Long resultId;

    // FK (DB Column: QUESTION_ID -> QUESTION 테이블 참조)
    private Long questionId;

    // 제출 답안 (DB Column: USER_ANSWER)
    private String userAnswer;

    // 정답 여부 'Y' / 'N' (DB Column: IS_CORRECT)
    private String isCorrect;
}
