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
@Alias("selfStudyResultVO")
@ToString
@Schema(description = "SelfStudyResultVO 데이터")
public class SelfStudyResultVO {

    @Schema(description = "셀프스터디 결과 번호", example = "1")
    private Long selfstudy_results_id;
    @Schema(description = "문제 생성 세션 번호", example = "1")
    private Long quiz_session_id;

    @Schema(description = "회원 번호", example = "1")
    private Long member_num;
    @Schema(description = "셀프스터디 총점", example = "80")
    private Integer selfstudy_total_score;
    @Schema(description = "제출 일시", example = "2026-10-14T10:30:00")
    private LocalDateTime submitted_at;
}