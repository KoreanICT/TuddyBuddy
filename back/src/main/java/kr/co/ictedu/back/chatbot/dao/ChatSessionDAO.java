package kr.co.ictedu.back.chatbot.dao;


import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.chatbot.vo.ChatSessionVO;

@Mapper
public interface ChatSessionDAO {

	// 새로운 채팅 세션 생성
	void add(ChatSessionVO vo);
	
	// 특정 세션 하나 조회
	ChatSessionVO detail(int chat_num);

	// 특정 회원의 채팅 세션 목록 조회
	List<ChatSessionVO> list(int member_num);
}
