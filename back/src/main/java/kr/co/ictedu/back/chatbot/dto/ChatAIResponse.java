// 허승표

package kr.co.ictedu.back.chatbot.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

// FastAPI의 AI 답변을 Spring에서 받는 DTO

@Data
@NoArgsConstructor
public class ChatAIResponse {

	private String answer;

}
