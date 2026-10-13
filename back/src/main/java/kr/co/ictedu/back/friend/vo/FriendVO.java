// 주용현

package kr.co.ictedu.back.friend.vo;

import org.apache.ibatis.type.Alias;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Schema(description = "친구 관계 및 친구 요청 정보")
@Alias("frvo")
@Setter
@Getter
public class FriendVO {

    @Schema(description = "친구 관계 번호", example = "1")
    private Long num;

    @Schema(description = "친구 요청 상태", example = "PENDING")
    private String status;

    @Schema(description = "친구 요청 날짜", example = "2026-10-13")
    private String requested_date;

    @Schema(description = "친구 요청 응답 날짜", example = "2026-10-13")
    private String responsed_date;

    @Schema(description = "친구 요청을 보낸 회원 번호", example = "1")
    private Long request_num;

    @Schema(description = "친구 요청을 받은 회원 번호", example = "2")
    private Long response_num;
}