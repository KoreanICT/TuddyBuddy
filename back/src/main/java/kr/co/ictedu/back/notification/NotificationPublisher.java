package kr.co.ictedu.back.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import kr.co.ictedu.back.notification.NotificationEvent.Category;

@Component
public class NotificationPublisher {

	@Autowired
	private ApplicationEventPublisher publisher;
	
	public void send(Long memberNum, Category category, String title, String message, String url) {
		publisher.publishEvent(new NotificationEvent(memberNum, category, title, message, url));
	}
}
