package kr.co.ictedu.back.groupchat.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("groupchatvo")
@Getter
@Setter
public class GroupChatVO {

	private Long chat_num;
	private Long group_num;
	private Long member_num;
	private String member_nick;
	private int state;
	private String value;
	private LocalDateTime created_at;
}
