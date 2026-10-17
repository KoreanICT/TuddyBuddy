//작성자 : 오진석
package kr.co.ictedu.back.group.dto;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("memolistdto")
@Getter
@Setter
public class MemoListDTO {

	private Long memo_num;
	private Long group_num;
	
	private String member_nick;
	private String memo_content;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	
	private int can_manage;
}
