package kr.co.ictedu.back.notice.vo;

import org.apache.ibatis.type.Alias;
import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Alias("novo")
@Getter
@Setter
public class NoticeVO {
	private Long num;
	private Long admin_num;
	private String title;
	private String content;
	private String imgn;
	private int hit;
	private String reip;
	private String created_date;
	private String updated_date;
	private MultipartFile mfile;
}
