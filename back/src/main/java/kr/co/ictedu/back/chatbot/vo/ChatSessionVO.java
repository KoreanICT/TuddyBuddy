package kr.co.ictedu.back.chatbot.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("csvo")
@Getter
@Setter
public class ChatSessionVO {
	
	private int chat_num;
	private Integer member_num; // 회원: 번호, 비회원: null
	private String chat_regdate;
}
