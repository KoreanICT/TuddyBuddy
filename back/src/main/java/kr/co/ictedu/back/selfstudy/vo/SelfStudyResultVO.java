package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Alias("selfStudyResultVO")
public class SelfStudyResultVO {

    private Long selfstudy_results_id;
    private Long quiz_session_id;

    private Long member_num;
    private Integer selfstudy_total_score;
    private LocalDateTime submitted_at;
}
