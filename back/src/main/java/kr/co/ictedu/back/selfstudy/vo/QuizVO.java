package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Alias("quizVO")
@ToString
public class QuizVO {

    private Long quiz_id;
    private Long quiz_session_id;
    private String quiz_question;
    private String quiz_selections ;
    private String quiz_correct_answer;
    private String quiz_explanation;
    private LocalDateTime created_at;
    
}