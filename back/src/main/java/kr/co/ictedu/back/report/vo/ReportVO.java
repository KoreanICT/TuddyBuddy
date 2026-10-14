
 // 주용현

package kr.co.ictedu.back.report.vo;

import org.apache.ibatis.type.Alias;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Schema(description = "신고 정보")
@Alias("revo")
@Getter
@Setter
public class ReportVO {

    @Schema(description = "신고 번호", example = "1")
    private Long num;

    @Schema(description = "신고한 회원 번호", example = "1")
    private Long member_num;
    
    @Schema(description = "신고 대상 번호", example = "15")
    private Long target_num;

    @Schema(description = "신고 대상 유형", example = "POST")
    private String type;

    @Schema(description = "신고 사유 분류", example = "SPAM")
    private String category;

    @Schema(description = "신고 내용", example = "부적절한 게시글을 신고합니다.")
    private String content;

    @Schema(description = "신고 처리 상태", example = "PENDING")
    private String status;

    @Schema(description = "신고 등록 날짜", example = "2026-10-13")
    private String created_date;
}
