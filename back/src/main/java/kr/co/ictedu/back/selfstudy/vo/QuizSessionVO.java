package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Alias("quizSessionVO")
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