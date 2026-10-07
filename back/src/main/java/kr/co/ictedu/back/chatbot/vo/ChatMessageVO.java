package kr.co.ictedu.back.chatbot.vo;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("cmvo")
@Getter
@Setter
public class ChatMessageVO {

	private int message_num;
	private int chat_num;
	private String message_sender;
	private String message_content;
	private String message_regdate;
}
