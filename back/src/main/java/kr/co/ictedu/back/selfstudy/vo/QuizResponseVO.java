package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizResponseVO {

    private Long quiz_responses_id;
    private Long selfstudy_results_id;
    private Long quiz_id;
    private String quiz_user_response;
    private String quiz_correct;
    private LocalDateTime submitted_at;
}
