package kr.co.ictedu.back.selfstudy.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("selfStudyDailyTrendVO")
@Getter
@Setter
public class SelfStudyDailyTrendVO {
    private String usage_date;
    private Long generated_count;
    private Long submitted_count;
}
