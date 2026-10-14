package kr.co.ictedu.back.chatbot.vo;

import org.apache.ibatis.type.Alias;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Alias("csvo")
@Getter
@Setter
@Schema(description = "챗봇 세션 정보")
public class ChatSessionVO {
	
	@Schema(description = "채팅 세션 번호", example = "1")
	private int chat_num;
	
	@Schema(description = "회원 번호(회원: 회원번호, 비회원: null)", example = "10", nullable = true)
	private Integer member_num; // 회원: 번호, 비회원: null
	
	@Schema(description = "채팅 세션 생성일", example = "2026-10-14 17:09:00")
	private String chat_regdate;
}
