package kr.co.ictedu.back.selfstudy.dto;

import java.util.List;

public class QuizSubmitRequestDto {

    private Long quizSession_id;
    private Long subject_id;
    private Long member_num;

    private List<QuizResponseDto> responses;
}
