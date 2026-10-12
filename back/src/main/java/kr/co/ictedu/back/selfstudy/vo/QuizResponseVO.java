package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Alias("quizResponseVO")
@ToString
public class QuizResponseVO {

    private Long quiz_responses_id;
    private Long selfstudy_results_id;
    private Long quiz_id;
    private String quiz_user_response;
    private String quiz_correct;
    private LocalDateTime submitted_at;
}
