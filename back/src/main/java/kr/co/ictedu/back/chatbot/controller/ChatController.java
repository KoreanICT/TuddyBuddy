package kr.co.ictedu.back.chatbot.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.ictedu.back.chatbot.dto.ChatAIRequest;
import kr.co.ictedu.back.chatbot.dto.ChatAIResponse;
import kr.co.ictedu.back.chatbot.service.ChatBotService;
import kr.co.ictedu.back.chatbot.service.ChatMessageService;
import kr.co.ictedu.back.chatbot.service.ChatSessionService;
import kr.co.ictedu.back.chatbot.vo.ChatMessageVO;
import kr.co.ictedu.back.chatbot.vo.ChatSessionVO;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "챗봇 API", description = "챗본 세션 생성, 조회, 메시지 저장")
@RestController
@RequestMapping("/api/chatbot")
public class ChatController {

	@Autowired
	private ChatSessionService sessionService;
	
	@Autowired
	private ChatMessageService messageService;
	
	@Autowired
	private ChatBotService chatBotService;
	
	// 새로운 채팅 세션 생성
	@Operation(summary = "채팅 세션 생성", description = "회원 또는 비회원의 새로운 채팅 세션을 생성합니다.")
	@ApiResponse(responseCode = "200", description = "채팅 세션 생성 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 세션 생성 요청")
	@ApiResponse(responseCode = "500", description = "채팅 세션 생성 중 서버 오류")
	@PostMapping("/session")
	public ChatSessionVO addSession(@RequestBody ChatSessionVO vo) {
		sessionService.add(vo);
		return vo;
	}
	
	// 특정 세션 하나 조회
	@Operation(summary = "채팅 세션 상세 조회", description = "채팅 세션 번호로 특정 세션 정보를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "체팅 세션 조회 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 채팅 세션 번호")
	@GetMapping("/session/{chat_num}")
	public ChatSessionVO detailSession(
			@Parameter(description = "채팅 세션 번호", example = "1")
			@PathVariable("chat_num") int chat_num) {
		return sessionService.detail(chat_num);
	}
	
	// 특정 회원의 채팅 세션 목록 조회
	@Operation(summary = "회원별 채팅 세션 목록 조회", description = "회원 번호로 해당 회원의 채팅 세션 목록을 조회합니다.")
	@ApiResponse(responseCode = "200", description = "체팅 세션 목록 조회 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 회원 번호")
	@GetMapping("/session/member/{member_num}")
	public List<ChatSessionVO> listSession(
			@Parameter(description = "회원 번호", example = "10")
			@PathVariable("member_num") int member_num){
		return sessionService.list(member_num);
	}
	
    // 메시지 저장
	@Operation(summary = "챗봇 메시지 저장", description = "사용자 또는 챗봇의 메시지를 DB에 저장합니다.")
	@ApiResponse(responseCode = "200", description = "메시지 저장 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 메시지 저장 요청")
	@ApiResponse(responseCode = "500", description = "메시지 저장 중 서버 오류")
    @PostMapping("/message")
    public void addMessage(@RequestBody ChatMessageVO vo) {
    	messageService.add(vo);
    }

    // 특정 세션의 대화 내용 조회
	@Operation(summary = "세션별 대화 내용 조회", description = "채팅 세션 번호로 해당 세션의 전체 대화 내용을 조회합니다.")
	@ApiResponse(responseCode = "200", description = "대화 내용 조회 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 채팅 세션 번호")
    @GetMapping("/message/session/{chat_num}")
    public List<ChatMessageVO> messageList(
    		@Parameter(description = "채팅 세션 번호", example = "1")
    		@PathVariable("chat_num") int chat_num) {
        return messageService.list(chat_num);
    }

    // 특정 회원의 전체 대화 내용 조회
	@Operation(summary = "회원별 전체 대화 내용 조회", description = "회원 번호로 해당 회원의 전체 챗봇 대화 내용을 조회합니다.")
	@ApiResponse(responseCode = "200", description = "회원 대화 내용 조회 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 회원 번호")
    @GetMapping("/message/member/{member_num}")
    public List<ChatMessageVO> memberMessageList(
    		@Parameter(description = "회원 번호", example = "10")
    		@PathVariable("member_num") int member_num) {
        return messageService.memberList(member_num);
    }
    
	// AI 챗봇 질문
	@Operation(summary = "AI 챗봇 질문", description = "사용자의 질문을 AI 서버로 전달하고 답변을 반환합니다.")
	@ApiResponse(responseCode = "200", description = "AI 답변 생성 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 AI 질문 요청")
	@ApiResponse(responseCode = "500", description = "AI 답변 처리 중 서버 오류")
    @PostMapping("/ai")
    public ChatAIResponse askAI(@RequestBody ChatAIRequest request) {
//    	System.out.println("question = " + request.getQuestion());
//    	System.out.println("user_type = " + request.getUser_type());
        return chatBotService.chat(request);
    }
    

}
