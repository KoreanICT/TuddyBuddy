package kr.co.ictedu.back.notification.dto;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("notificationdto")
@Getter
@Setter
public class NotificationDTO {

	private Long notification_num;
	private Long member_num; 
	private String title;
	private String category;
	private String message;
	private String target_url;
	private int is_checked;
	private LocalDateTime created_at;
}
