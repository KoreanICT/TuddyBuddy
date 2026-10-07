package kr.co.ictedu.back.chatbot.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.chatbot.dao.ChatSessionDAO;
import kr.co.ictedu.back.chatbot.vo.ChatSessionVO;

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
	public List<ChatSessionVO> list(int member_num) {
		return chatSessionDAO.list(member_num);
	}
}
