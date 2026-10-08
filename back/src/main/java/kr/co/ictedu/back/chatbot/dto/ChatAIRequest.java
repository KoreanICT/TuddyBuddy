package kr.co.ictedu.back.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// React에서 Spring으로 챗봇 요청을 전달하는 DTO

// 기본 메서드 자동 생성
@Data
// 매개변수가 없는 생성자 자동 생성
@NoArgsConstructor
// 모든 필드를 매개변수로 받는 생성자 자동 생성
@AllArgsConstructor
public class ChatAIRequest {

	private int chat_num;
	private String question;
	private String user_type;
}
