package kr.co.ictedu.back.selfstudy.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Alias("subjectVO")
@ToString
public class SubjectVO {

    private Long subject_id;
    private Long category_id;
    private String subject_name;
    private Integer usage_count;
    private LocalDateTime created_at;
}
