package kr.co.ictedu.back.selfstudy.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("selfStudySubjectRankingVO")
@Getter
@Setter
public class SelfStudySubjectRankingVO {
    private Long subject_id;
    private String subject_name;
    private String category_name;
    private Long generated_count;
}
