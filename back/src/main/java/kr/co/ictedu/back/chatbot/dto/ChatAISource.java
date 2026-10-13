package kr.co.ictedu.back.chatbot.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

// AI 답변에 사용된 출처(파일명, 페이지)를 받는 DTO

@Data
@NoArgsConstructor
public class ChatAISource {

	private String source;
	// 페이지를 못찾는 경우 문자열 반환이 가능하기 때문에 Object
	private Object page;
}
