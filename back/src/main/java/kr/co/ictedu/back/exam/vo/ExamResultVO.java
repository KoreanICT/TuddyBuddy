package kr.co.ictedu.back.exam.vo;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamResultVO {
	
	// PK (DB Column: RESULT_ID)
    private Long resultId;

    // FK (DB Column: MEMBER_ID -> MEMBER 테이블 참조)
    private Long memberId;

    // 과목명 (DB Column: SUBJECT_NAME)
    private String subjectName;

    // 가변 구간 JSON 데이터 (DB Column: SECTION_SCORES, Oracle CLOB)
    private String sectionScores;

    // 생성 일시 (DB Column: CREATED_AT)
    private String createdAt;

    // 1:N Foreign Key 관계 표현 (EXAM_RESULT 1 : N EXAM_ANSWER_LOG)
    private List<ExamAnswerLogVO> answerLogs;
}
