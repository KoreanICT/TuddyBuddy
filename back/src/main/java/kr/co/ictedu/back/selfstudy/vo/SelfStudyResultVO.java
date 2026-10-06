package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SelfStudyResultVO {

    private Long selfstudy_results_id;
    private Long quiz_session_id;
    private Long subject_id;
//    private Long member_num;
    private Integer selfstudy_total_score;
    private LocalDateTime submitted_at;
}
