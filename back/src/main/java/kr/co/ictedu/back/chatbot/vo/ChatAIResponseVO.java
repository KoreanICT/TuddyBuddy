// 허승표

package kr.co.ictedu.back.chatbot.vo;

import lombok.Data;
import lombok.NoArgsConstructor;

// FastAPI의 AI 답변을 Spring에서 받는 VO

@Data
@NoArgsConstructor
public class ChatAIResponseVO {

	private String answer;

}
