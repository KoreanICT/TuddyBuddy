package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizSessionVO {

    private Long quiz_session_id;
    private Long subject_id;
    private Long member_num;
    private String quiz_image_url;
    private String quiz_type;
    private String quiz_difficulty;
    private Integer quiz_count;
    private String quiz_prompt;
    private LocalDateTime created_at;
}