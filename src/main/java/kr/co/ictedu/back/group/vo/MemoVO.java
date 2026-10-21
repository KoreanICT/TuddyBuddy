//작성자 : 오진석
package kr.co.ictedu.back.group.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("memovo")
@Getter
@Setter
public class MemoVO {

	private Long memo_num;
	private Long group_num;
	private Long member_num;
	private String memo_content;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	
}
