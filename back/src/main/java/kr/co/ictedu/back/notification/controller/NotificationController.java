package kr.co.ictedu.back.notification.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import kr.co.ictedu.back.notification.dto.NotificationDTO;
import kr.co.ictedu.back.notification.service.NotificationService;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {

	@Autowired
	private NotificationService service;
	
	@GetMapping("/subscribe")
	public SseEmitter subscribe(@RequestHeader("member_num") Long memberNum) {
		return service.subscribe(memberNum);
	}
	
	@GetMapping("/unread")
	public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@RequestHeader("member_num") Long memberNum) {
		List<NotificationDTO> list = service.getUnreadNotifications(memberNum);
		return ResponseEntity.ok(list);
	}
	
	@GetMapping("/getAllNotification")
	public ResponseEntity<List<NotificationDTO>> getAllNotification(@RequestHeader("member_num") Long memberNum) {
		List<NotificationDTO> list = service.getNotifications(memberNum);
		return ResponseEntity.ok(list);
	}
	
	@PatchMapping("/read/{notificationNum}")
	public ResponseEntity<String> readNotification(@RequestHeader("member_num") Long memberNum, @PathVariable("notificationNum") Long notificationNum) {
		service.readNotification(memberNum, notificationNum);
		return ResponseEntity.ok("읽음 처리 완료");
	}
	
	@PatchMapping("/readAll")
	public ResponseEntity<String> readAll(@RequestHeader("member_num") Long memberNum) {
		service.readAll(memberNum);
		return ResponseEntity.ok("전체 읽음 처리 완료");
	}
}
