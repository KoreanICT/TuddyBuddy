// 허승표

package kr.co.ictedu.back.chatbot.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.chatbot.dao.ChatSessionDAO;
import kr.co.ictedu.back.chatbot.vo.ChatSessionVO;


// 채팅 세션 DB 처리

@Service
public class ChatSessionService {

	@Autowired
	private ChatSessionDAO chatSessionDAO;
		
	// 새로운 채팅 세션 생성
	public void add(ChatSessionVO vo) {
		chatSessionDAO.add(vo);
	}
	
	// 특정 세션 하나 조회
	public ChatSessionVO detail(int chat_num) {
		return chatSessionDAO.detail(chat_num);
	}
	
	// 특정 회원의 채팅 세션 목록 조회
	public List<ChatSessionVO> list(Long member_num) {
		return chatSessionDAO.list(member_num);
	}
	
	// 로그인 회원의 채팅 세션 소유권 검증
	public void vaildateMemberSession(int chat_num, Long member_num) {
		
		// 세션 존재 여부 확인
		ChatSessionVO session = chatSessionDAO.detail(chat_num);
		
		if (session == null) {
			throw new ResponseStatusException(
					HttpStatus.NOT_FOUND,
					"존재하지 않는 채팅 세션입니다."
			);
		}
		
		// 로그인 회원 번호 확인
		if (member_num == null) {
			throw new ResponseStatusException(
					HttpStatus.UNAUTHORIZED,
					"로그인이 필요합니다."
			);
		}
		
		// 세션 소유권 확인
		if (!member_num.equals(session.getMember_num())) {
			throw new ResponseStatusException(
					HttpStatus.FORBIDDEN,
					"접근 권한이 없는 채팅 세션입니다."
			);
		}
	}
}
