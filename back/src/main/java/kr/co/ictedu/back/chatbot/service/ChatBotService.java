// 허승표

package kr.co.ictedu.back.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.chatbot.vo.ChatAIRequestVO;
import kr.co.ictedu.back.chatbot.vo.ChatAIResponseVO;
import kr.co.ictedu.back.chatbot.vo.ChatMessageVO;
import kr.co.ictedu.back.chatbot.vo.ChatSessionVO;

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

	@Autowired
	private ChatSessionService chatSessionService;

	// 사용자 질문 DB 저장
	public void saveUserMessage(ChatAIRequestVO request) {
		ChatMessageVO message = new ChatMessageVO();
		message.setChat_num(request.getChat_num());
		message.setMessage_sender("user");
		message.setMessage_content(request.getQuestion());

		chatMessageService.add(message);
	}

	// ChatAIService을 통해 FastAPI 호출
	public ChatAIResponseVO askAI(ChatAIRequestVO request) {
		return chatAIService.askAI(request);
	}

	// AI 답변 DB 저장
	public void saveBotMessage(ChatAIRequestVO request, ChatAIResponseVO response) {
		ChatMessageVO message = new ChatMessageVO();
		message.setChat_num(request.getChat_num());
		message.setMessage_sender("bot");
		message.setMessage_content(response.getAnswer());

		chatMessageService.add(message);
	}

	// 전체 챗봇 처리
	public ChatAIResponseVO chat(ChatAIRequestVO request) {

		// 질문 유효성 검증
		if (request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "질문 내용을 입력해 주세요.");
		}
		
		if (request.getQuestion().length() > 1000) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"질문은 1,000자 이하로 입력해 주세요.");
		}
		
		// 채팅 세션 존재 여부 확인
		ChatSessionVO session = chatSessionService.detail(request.getChat_num());

		if (session == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 채팅 세션입니다.");
		}

		// 사용자 질문 DB 저장
		saveUserMessage(request);

		try {
			// FastAPI 호출
			ChatAIResponseVO response = askAI(request);
			
			// 응답이 없거나 답변이 비어 있으면 오류 처리
			if (
				response == null ||
				response.getAnswer() == null ||
				response.getAnswer().trim().isEmpty()
			) {
				throw new RestClientException("AI 답변 내용이 없습니다.");
			}
			
			// AI 답변 DB 저장
			saveBotMessage(request, response);

			// 정상 응답 반환
			return response;

		} catch (RestClientException e) { // RestClientException : HTTP 통신 관련 예외 클래스

			// AI 서버 통신 오류 안내
			ChatAIResponseVO errorResponse = new ChatAIResponseVO();

			errorResponse.setAnswer("죄송합니다. 현재 답변을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.");

			// 다시 열었을 때도 오류 안내를 볼 수 있도록 저장
			saveBotMessage(request, errorResponse);
			
			// 정상 응답 대신 서비스 이용 불가 상태 반환
			throw new ResponseStatusException(
					HttpStatus.SERVICE_UNAVAILABLE,
					errorResponse.getAnswer(),
					e
			);
		}
	}
}
