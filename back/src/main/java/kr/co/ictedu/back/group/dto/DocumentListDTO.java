package kr.co.ictedu.back.group.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentListDTO {

	private int can_manage;
	private Long document_num;
	private String document_title;
	private String original_name;
	private String stored_name;
	private String document_path;
	private String document_type;
	private Long document_size;
	private Long hit;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
}
