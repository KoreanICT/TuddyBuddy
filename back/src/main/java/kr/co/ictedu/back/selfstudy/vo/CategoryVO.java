package kr.co.ictedu.back.selfstudy.vo;

import org.apache.ibatis.type.Alias;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Alias("categoryVO")
@ToString
public class CategoryVO {
    private Long category_id;
    private String category_name;
}