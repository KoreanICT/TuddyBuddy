// 허승표

package kr.co.ictedu.back.chatbot.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

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

	@Autowired
	private MemberDAO memberDAO;

	// 새로운 채팅 세션 생성
	@Operation(summary = "채팅 세션 생성", description = "회원 또는 비회원의 새로운 채팅 세션을 생성합니다.")
	@ApiResponse(responseCode = "200", description = "채팅 세션 생성 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 세션 생성 요청")
	@ApiResponse(responseCode = "500", description = "채팅 세션 생성 중 서버 오류")
	@PostMapping("/session")
	public ChatSessionVO addSession(@RequestBody ChatSessionVO vo, Authentication authentication) {

		// 기본값: 비회원
		Long memberNum = null;

		// JWT로 인증된 회원인 경우
		if (authentication != null && authentication.isAuthenticated()
				&& authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {

			// JWT 인증 정보에서 회원 이메일 추출
			String email = authentication.getName();

			// 이메일로 회원 정보 조회
			MemberVO member = memberDAO.getMemberByEmail(email);

			if (member == null) {
				throw new org.springframework.web.server.ResponseStatusException(
						org.springframework.http.HttpStatus.UNAUTHORIZED, "인증된 회원 정보를 찾을 수 없습니다.");
			}

			// 실제 로그인 회원 번호 사용
			memberNum = member.getMember_num();
		}

		// 클라이언트가 보낸 member_num을 덮어씀
		vo.setMember_num(memberNum);

		// 기존 세션 생성 로직 유지
		sessionService.add(vo);

		return vo;
	}

	// 특정 세션 하나 조회
	@Operation(summary = "채팅 세션 상세 조회", description = "채팅 세션 번호로 특정 세션 정보를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "체팅 세션 조회 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 채팅 세션 번호")
	@GetMapping("/session/{chat_num}")
	public ChatSessionVO detailSession(
			@Parameter(description = "채팅 세션 번호", example = "1") @PathVariable("chat_num") int chat_num,
			Authentication authentication) {
		
		// 조회할 채팅 세션 확인
		ChatSessionVO session = sessionService.detail(chat_num);
		
		if (session == null) {
			throw new ResponseStatusException(
					HttpStatus.NOT_FOUND,
					"존재하지 않는 채팅 세션입니다.");
		}
		
		// 회원 세션인 경우에만 JWT 인증 검증
		if (session.getMember_num() != null) {
			Long loginMemberNum = getLoginMemberNum(authentication);
			sessionService.vaildateMemberSession(chat_num, loginMemberNum);
		}
		
		// 비회원 세션은 기존 방식으로 조회
		return session;
	}

	// 특정 회원의 채팅 세션 목록 조회
	@Operation(summary = "회원별 채팅 세션 목록 조회", description = "회원 번호로 해당 회원의 채팅 세션 목록을 조회합니다.")
	@ApiResponse(responseCode = "200", description = "체팅 세션 목록 조회 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 회원 번호")
	@GetMapping("/session/member/{member_num}")
	public List<ChatSessionVO> listSession(
			@Parameter(description = "회원 번호", example = "10") @PathVariable("member_num") Long member_num,
			Authentication authentication) {

		Long loginMemberNum = getLoginMemberNum(authentication);

		if (!loginMemberNum.equals(member_num)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "다른 회원의 채팅 세션은 조회할 수 없습니다.");
		}

		return sessionService.list(member_num);
	}

	// 특정 세션의 대화 내용 조회
	@Operation(summary = "세션별 대화 내용 조회", description = "채팅 세션 번호로 해당 세션의 전체 대화 내용을 조회합니다.")
	@ApiResponse(responseCode = "200", description = "대화 내용 조회 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 채팅 세션 번호")
	@GetMapping("/message/session/{chat_num}")
	public List<ChatMessageVO> messageList(
			@Parameter(description = "채팅 세션 번호", example = "1") @PathVariable("chat_num") int chat_num,
			Authentication authentication) {
		
		// 채팅 세션 조회
		ChatSessionVO session = sessionService.detail(chat_num);
		
		// 존재하지 않는 세션 검사
		if (session == null) {
			throw new ResponseStatusException(
					HttpStatus.NOT_FOUND,
					"존재하지 않는 채팅 세션입니다.");
		}
		
		// 회원 세션인 경우 소유권 검증
		if (session.getMember_num() != null) {
			Long loginMemberNum = getLoginMemberNum(authentication);
			sessionService.vaildateMemberSession(chat_num, loginMemberNum);
		}
		
		// 메시지 목록 반환
		return messageService.list(chat_num);
	}

	// 특정 회원의 전체 대화 내용 조회
	@Operation(summary = "회원별 전체 대화 내용 조회", description = "회원 번호로 해당 회원의 전체 챗봇 대화 내용을 조회합니다.")
	@ApiResponse(responseCode = "200", description = "회원 대화 내용 조회 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 회원 번호")
	@GetMapping("/message/member/{member_num}")
	public List<ChatMessageVO> memberMessageList(
			@Parameter(description = "회원 번호", example = "10") @PathVariable("member_num") Long member_num,
			Authentication authentication) {
		
		// JWT에서 로그인 회원 번호 조회
		Long loginMemberNum = getLoginMemberNum(authentication);
		
		// 요청한 회원 번호와 로그인 회원 번호 비교
		if (!loginMemberNum.equals(member_num)) {
			throw new ResponseStatusException(
					HttpStatus.FORBIDDEN,
					"다른 회원의 채팅 메시지는 조회할 수 없습니다.");
		}
		
		// 본인 메시지만 조회
		return messageService.memberList(member_num);
	}

	// AI 챗봇 질문
	@Operation(summary = "AI 챗봇 질문", description = "사용자의 질문을 AI 서버로 전달하고 답변을 반환합니다.")
	@ApiResponse(responseCode = "200", description = "AI 답변 생성 성공")
	@ApiResponse(responseCode = "400", description = "잘못된 AI 질문 요청")
	@ApiResponse(responseCode = "500", description = "AI 답변 처리 중 서버 오류")
	@PostMapping("/ai")
	public ChatAIResponse askAI(@RequestBody ChatAIRequest request, Authentication authentication) {
//    	System.out.println("question = " + request.getQuestion());
//    	System.out.println("user_type = " + request.getUser_type());
		
		// 요청한 채팅 세션 조회
		ChatSessionVO session = sessionService.detail(request.getChat_num());
		
		// 존재하지 않는 세션 검사
		if (session == null) {
			throw new ResponseStatusException(
					HttpStatus.NOT_FOUND,
					"존재하지 않는 채팅 세션입니다.");
		}
		
		// 회원/비회원 구분
		if (session.getMember_num() != null) {
			
			// 회원 세션이면 JWT 인증 회원 번호 조회
			Long loginMemberNum = getLoginMemberNum(authentication);
			
			// 회원 세션 소유권 검증
			sessionService.vaildateMemberSession(request.getChat_num(), loginMemberNum);
			
			// 검증된 회원 세션
			request.setUser_type("member");
		} else {
			// 비회원 세션
			request.setUser_type("guest");
		}
		
		// 서버에서 최종 결정한 회원 유형 확인
		System.out.println("챗봇 최종 user_type : " + request.getUser_type());
		
		// 서버에서 결정한 user_type으로 AI 서비스 호출
		return chatBotService.chat(request);
	}

	// JWT 인증 정보에서 로그인 회원 번호 조회
	private Long getLoginMemberNum(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()
				|| !(authentication.getPrincipal() instanceof UserDetails)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}

		String email = authentication.getName();
		MemberVO member = memberDAO.getMemberByEmail(email);

		if (member == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "회원 정보를 찾을 수 없습니다.");
		}

		return member.getMember_num();
	}

}
