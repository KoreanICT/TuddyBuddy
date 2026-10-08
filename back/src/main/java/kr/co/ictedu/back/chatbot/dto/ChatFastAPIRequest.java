package kr.co.ictedu.back.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Spring에서 FastAPI로 AI 질문을 전달하는 DTO

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatFastAPIRequest {

	private String question;
	private String user_type;
}
