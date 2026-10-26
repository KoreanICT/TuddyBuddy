package kr.co.ictedu.back.notification.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.notification.dto.NotificationDTO;
import kr.co.ictedu.back.notification.service.NotificationService;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {

	@Autowired
	private NotificationService service;

	@Autowired
	private MemberService memberService;

	@GetMapping("/subscribe")
	public SseEmitter subscribe(@RequestHeader("memberNum") Long memberNum) {
		return service.subscribe(memberNum);
	}

	@GetMapping("/unread")
	public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@RequestHeader("memberNum") Long memberNum) {
		List<NotificationDTO> list = service.getUnreadNotifications(memberNum);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/getAllNotification")
	public ResponseEntity<List<NotificationDTO>> getAllNotification(@RequestHeader("memberNum") Long memberNum) {
		List<NotificationDTO> list = service.getNotifications(memberNum);
		return ResponseEntity.ok(list);
	}

	@PatchMapping("/read/{notificationNum}")
	public ResponseEntity<String> readNotification(@RequestHeader("memberNum") Long memberNum,
			@PathVariable("notificationNum") Long notificationNum) {
		service.readNotification(memberNum, notificationNum);
		return ResponseEntity.ok("읽음 처리 완료");
	}

	@PatchMapping("/readAll")
	public ResponseEntity<String> readAll(@RequestHeader("memberNum") Long memberNum) {
		service.readAll(memberNum);
		return ResponseEntity.ok("전체 읽음 처리 완료");
	}

	@DeleteMapping("/delete/{notificationNum}")
	public ResponseEntity<String> deleteNotification(
	        @PathVariable("notificationNum") Long notificationNum,
	        Authentication authentication) {

	    MemberVO member = getMember(authentication);

	    service.deleteNotification(
	        member.getMember_num(),
	        notificationNum
	    );

	    return ResponseEntity.ok("삭제 완료");
	}
	
	private MemberVO getMember(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}

		MemberVO member = memberService.getMemberByEmail(authentication.getName());

		if (member == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		return member;
	}
}
