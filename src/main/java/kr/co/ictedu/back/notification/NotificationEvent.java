package kr.co.ictedu.back.notification;

import lombok.Getter;

@Getter
public class NotificationEvent {

	private final Long memberNum;
	private final NotificationType type;
	private final String title;
	private final String message;
	private final String url;
	
	public enum NotificationType {JOIN, REPORT, COMMENT}
	public NotificationEvent(Long memberNum, NotificationType type, String title, String message, String url) {
		this.memberNum = memberNum;
		this.type = type;
		this.title = title;
		this.message = message;
		this.url = url;
	}
}
