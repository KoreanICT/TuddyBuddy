package kr.co.ictedu.back.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import kr.co.ictedu.back.notification.NotificationEvent.NotificationType;

@Component
public class NotificationPublisher {

	@Autowired
	private ApplicationEventPublisher publisher;
	
	public void send(Long memberNum, NotificationType type, String title, String message, String url) {
		publisher.publishEvent(new NotificationEvent(memberNum, type, title, message, url));
	}
}
