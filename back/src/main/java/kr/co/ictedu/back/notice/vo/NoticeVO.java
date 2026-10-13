// 주용현

package kr.co.ictedu.back.notice.vo;

import org.apache.ibatis.type.Alias;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Alias("novo")
@Getter
@Setter
@Schema(description = "공지사항 정보")
public class NoticeVO {

    @Schema(description = "공지사항 번호", example = "1")
    private Long num;

    @Schema(description = "작성자 회원 번호", example = "1")
    private Long member_num;

    @Schema(description = "공지사항 제목", example = "공지사항 안내")
    private String title;

    @Schema(description = "공지사항 내용", example = "공지사항 내용입니다.")
    private String content;

    @Schema(description = "첨부 이미지 파일명", example = "notice.jpg")
    private String imgn;

    @Schema(description = "조회수", example = "0")
    private int hit;

    @Schema(description = "작성자 IP 주소", example = "127.0.0.1")
    private String reip;

    @Schema(description = "작성일", example = "2026-10-13")
    private String created_date;

    @Schema(description = "수정일", example = "2026-10-13")
    private String updated_date;

    @Schema(description = "첨부 이미지 파일", type = "string", format = "binary")
    private MultipartFile mfile;
}
