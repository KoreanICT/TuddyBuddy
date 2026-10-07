package kr.co.ictedu.back.selfstudy.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Alias("categoryVO")
public class CategoryVO {
    private Long category_id;
    private String category_name;
}