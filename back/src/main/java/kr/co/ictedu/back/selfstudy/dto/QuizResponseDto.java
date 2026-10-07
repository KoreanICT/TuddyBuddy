package kr.co.ictedu.back.selfstudy.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizResponseDto {

    private Long quiz_id;
    private String quiz_user_response;
}
