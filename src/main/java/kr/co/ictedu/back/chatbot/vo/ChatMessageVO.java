// 허승표

package kr.co.ictedu.back.chatbot.vo;

import org.apache.ibatis.type.Alias;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Alias("cmvo")
@Getter
@Setter
@Schema(description = "채팅 메시지 정보")
public class ChatMessageVO {

	@Schema(description = "메시지 번호", example = "1")
	private int message_num;
	
	@Schema(description = "채팅 세션 번호", example = "10")
	private int chat_num;
	
	@Schema(description = "메시지 발신자(user: 사용자, bot: 챗봇)", example = "user", allowableValues = {"user", "bot"})
	private String message_sender;
	
	@Schema(description = "메시지 내용", example = "회원가입은 어떻게 하나요?")
	private String message_content;
	
	@Schema(description = "메시지 작성일", example = "2026-10-14 17:09:00")
	private String message_regdate;
}
