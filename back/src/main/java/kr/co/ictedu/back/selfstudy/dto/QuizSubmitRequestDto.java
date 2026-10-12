package kr.co.ictedu.back.selfstudy.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class QuizSubmitRequestDto {

    private Long quiz_sessionid;
    private Long subject_id;
    private Long member_num;

    private List<QuizResponseDto> responses;
}