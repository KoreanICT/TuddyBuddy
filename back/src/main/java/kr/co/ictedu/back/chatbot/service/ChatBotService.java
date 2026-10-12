package kr.co.ictedu.back.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import kr.co.ictedu.back.chatbot.dto.ChatAIRequest;
import kr.co.ictedu.back.chatbot.dto.ChatAIResponse;
import kr.co.ictedu.back.chatbot.vo.ChatMessageVO;

// 챗봇 전체 흐름 처리
//  1) 사용자 질문 DB 저장
//  2) ChatAIService 호출
//  3) AI 답변 DB 저장
//  4) 최종 응답 반환

@Service
public class ChatBotService {

	@Autowired
	private ChatMessageService chatMessageService;
	
	@Autowired
	private ChatAIService chatAIService;
	
	// 사용자 질문 DB 저장
	public void saveUserMessage(ChatAIRequest request) {
		ChatMessageVO message = new ChatMessageVO();
		message.setChat_num(request.getChat_num());
		message.setMessage_sender("user");
		message.setMessage_content(request.getQuestion());
		
		chatMessageService.add(message);
	}
	
	// ChatAIService을 통해 FastAPI 호출
	public ChatAIResponse askAI(ChatAIRequest request) {
		return chatAIService.askAI(request);
	}
	
	// AI 답변 DB 저장
	public void saveBotMessage(ChatAIRequest request, ChatAIResponse response) {
		ChatMessageVO message = new ChatMessageVO();
		message.setChat_num(request.getChat_num());
		message.setMessage_sender("bot");
		message.setMessage_content(response.getAnswer());
		
		chatMessageService.add(message);
	}
	
	// 전체 챗봇 처리
	public ChatAIResponse chat(ChatAIRequest request) {
		
		// 사용자 질문 DB 저장
		saveUserMessage(request);
		
		try {
			// FastAPI 호출
			ChatAIResponse response = askAI(request);
			
			// AI 답변 DB 저장
			saveBotMessage(request, response);
			
			// 정상 응답 반환
			return response;
		
		} catch (RestClientException e) { // RestClientException : HTTP 통신 관련 예외 클래스
			// AI 서버 통신 오류 안내
			ChatAIResponse errorResponse = new ChatAIResponse();
			
			errorResponse.setAnswer(
					"죄송합니다. 현재 답변을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요."
			);
			
			// 오류 안내 DB 저장
			saveBotMessage(request, errorResponse);
			
			// 오류 안내 반환
			return errorResponse;
		}
		
				
	}
}
