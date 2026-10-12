package kr.co.ictedu.back.chatbot.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

// FastAPI의 AI 답변을 Spring에서 받는 DTO

@Data
@NoArgsConstructor
public class ChatAIResponse {

	private String answer;
	// 출처가 여러개 올 수 있으므로 List
	private List<ChatAISource> sources;
}
