package kr.co.ictedu.back.chatbot.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
	@PostMapping("/session")
	public ChatSessionVO addSession(@RequestBody ChatSessionVO vo) {
		sessionService.add(vo);
		return vo;
	}
	
	// 특정 세션 하나 조회
	@GetMapping("/session/{chat_num}")
	public ChatSessionVO detailSession(@PathVariable int chat_num) {
		return sessionService.detail(chat_num);
	}
	
	// 특정 회원의 채팅 세션 목록 조회
	@GetMapping("/session/member/{member_num}")
	public List<ChatSessionVO> listSession(@PathVariable int member_num){
		return sessionService.list(member_num);
	}
	
    // 메시지 저장
    @PostMapping("/message")
    public void addMessage(@RequestBody ChatMessageVO vo) {
    	messageService.add(vo);
    }

    // 특정 세션의 대화 내용 조회
    @GetMapping("/message/session/{chat_num}")
    public List<ChatMessageVO> messageList(@PathVariable("chat_num") int chat_num) {
        return messageService.list(chat_num);
    }

    // 특정 회원의 전체 대화 내용 조회
    @GetMapping("/message/member/{member_num}")
    public List<ChatMessageVO> memberMessageList(@PathVariable int member_num) {
        return messageService.memberList(member_num);
    }
    
    @PostMapping("/ai")
    public ChatAIResponse askAI(@RequestBody ChatAIRequest request) {
//    	System.out.println("question = " + request.getQuestion());
//    	System.out.println("user_type = " + request.getUser_type());
        return chatBotService.chat(request);
    }
    

}
