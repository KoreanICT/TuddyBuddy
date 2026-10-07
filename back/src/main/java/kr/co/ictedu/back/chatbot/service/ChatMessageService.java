package kr.co.ictedu.back.chatbot.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.chatbot.dao.ChatMessageDAO;
import kr.co.ictedu.back.chatbot.vo.ChatMessageVO;

@Service
public class ChatMessageService {

	@Autowired
	private ChatMessageDAO chatMessageDAO;
	
	// 메시지 저장
	public void add(ChatMessageVO vo) {
		chatMessageDAO.add(vo);
	}

	// 특정 세션의 대화 내용
	public List<ChatMessageVO> list(int chat_num) {
		return chatMessageDAO.list(chat_num);
	}
	
	// 특정 회원의 전체 대화 내용
	public List<ChatMessageVO> memberList(int member_num) {
		return chatMessageDAO.memberList(member_num);
	}
}
