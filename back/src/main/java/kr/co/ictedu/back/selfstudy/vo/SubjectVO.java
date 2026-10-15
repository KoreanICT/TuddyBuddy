//최솔
package kr.co.ictedu.back.selfstudy.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@Alias("subjectVO")
@ToString
@Schema(description = "SubjectVO 데이터")
public class SubjectVO {

    @Schema(description = "과목 번호", example = "1")
    private Long subject_id;
    
    @Schema(description = "카테고리 번호", example = "1")
    private Long category_id;
    
    @Schema(description = "과목 이름", example = "자바")
    private String subject_name;
    
    @Schema(description = "과목 사용 횟수", example = "10")
    private Integer usage_count;
    
    @Schema(description = "생성 일시", example = "2026-10-14T10:00:00")
    private LocalDateTime created_at;
    
    //서브젝트 추가, 삭제 활성화를 위해 추가
    @Schema(description = "과목 활성화 여부", example = "Y")
    private String subject_status;
}