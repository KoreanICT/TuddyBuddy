package kr.co.ictedu.back.selfstudy.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("selfStudyUsageSummaryVO")
@Getter
@Setter
public class SelfStudyUsageSummaryVO {
    private Long generated_count;
    private Long participant_count;
    private Long submitted_count;
    private Double average_score;
}
