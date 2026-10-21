package kr.co.ictedu.back.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import kr.co.ictedu.back.notification.dto.NotificationDTO;
import kr.co.ictedu.back.notification.service.NotificationService;

@Component
public class NotificationEventListener {

	@Autowired
	private final NotificationService notificationService;

	public NotificationEventListener(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handle(NotificationEvent event) {
		
		NotificationDTO dto = new NotificationDTO();
		
		dto.setMember_num(event.getMemberNum());
		dto.setCategory(event.getType().toString());
		dto.setMessage(event.getMessage());
		dto.setTitle(event.getTitle());
		dto.setTarget_url(event.getUrl());
		dto.setIs_checked(0);
		
		notificationService.send(event.getMemberNum(), dto);
	}
}
