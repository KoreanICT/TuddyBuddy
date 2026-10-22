// 주용현

package kr.co.ictedu.back.report.vo;

import org.apache.ibatis.type.Alias;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Schema(description = "신고 답변 정보")
@Alias("rerevo")
@Getter
@Setter
public class ReportReplyVO {

    @Schema(description = "신고 답변 번호", example = "1")
    private Long num;

    @Schema(description = "신고 답변 내용", example = "신고 내용을 확인하였으며, 조치를 완료했습니다.")
    private String content;

    @Schema(description = "신고 답변 등록 날짜", example = "2026-10-13")
    private String created_date;

    @Schema(description = "신고 번호", example = "1")
    private Long report_num;

    @Schema(description = "답변을 작성한 관리자 번호", example = "2")
    private Long admin_num;
}
