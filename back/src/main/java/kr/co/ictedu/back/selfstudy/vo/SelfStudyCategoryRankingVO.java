package kr.co.ictedu.back.selfstudy.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("selfStudyCategoryRankingVO")
@Getter
@Setter
public class SelfStudyCategoryRankingVO {
    private Long category_id;
    private String category_name;
    private Long generated_count;
}
