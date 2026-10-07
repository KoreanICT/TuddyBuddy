package kr.co.ictedu.back.chatbot.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.chatbot.vo.ChatMessageVO;

@Mapper
public interface ChatMessageDAO {
	
	// 메시지 저장
	void add(ChatMessageVO vo);

	// 특정 세션의 대화 내용
	List<ChatMessageVO> list(int chat_num);
	
	// 특정 회원의 전체 대화 내용
	List<ChatMessageVO> memberList(int member_num);

}
