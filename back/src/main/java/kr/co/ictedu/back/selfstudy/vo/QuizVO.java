package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizVO {

    private Long quiz_id;
    private Long quiz_session_id;
    private String quiz_question;
    private String quiz_selections ;
    private String quiz_correct_answer;
    private String quiz_explanation;
    private LocalDateTime created_at;
    
}