//최솔
package kr.co.ictedu.back.selfstudy.vo;
import io.swagger.v3.oas.annotations.media.Schema;
import org.apache.ibatis.type.Alias;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Alias("categoryVO")
@ToString
@Schema(description = "CategoryVO 데이터")
public class CategoryVO {
    @Schema(description = "카테고리 번호", example = "1")
    private Long category_id;
    @Schema(description = "카테고리 이름", example = "프로그래밍")
    private String category_name;
}