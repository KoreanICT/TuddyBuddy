package kr.co.ictedu.back.notification;

import lombok.Getter;

@Getter
public class NotificationEvent {

	private final Long memberNum;
	private final Category category;
	private final String title;
	private final String message;
	private final String url;
	
	public enum Category {JOIN, JOIN_APPROVED, JOIN_REJECTED, REPORT, COMMENT, STUDY_DELETED, FRIEND_REQUEST, FRIEND_ACCEPTED}
	public NotificationEvent(Long memberNum, Category category, String title, String message, String url) {
		this.memberNum = memberNum;
		this.category = category;
		this.title = title;
		this.message = message;
		this.url = url;
	}
}
