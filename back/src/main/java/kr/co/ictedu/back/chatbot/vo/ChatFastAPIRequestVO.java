// 허승표

package kr.co.ictedu.back.chatbot.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Spring에서 FastAPI로 AI 질문을 전달하는 VO

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatFastAPIRequestVO {

	private String question;
	private String user_type;
}
