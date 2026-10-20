package kr.co.ictedu.back.group.dto;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("tdldto")
@Getter
@Setter
public class TdlDTO {
	private Long tdl_num;
	private String member_nick;
	private String tdl_name;
	private String tdl_detail;
	private LocalDateTime due_at;
}
