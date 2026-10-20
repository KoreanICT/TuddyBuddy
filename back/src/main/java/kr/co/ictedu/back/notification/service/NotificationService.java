//작성자 : 오진석
package kr.co.ictedu.back.notification.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import kr.co.ictedu.back.notification.SseEmitterRepository;
import kr.co.ictedu.back.notification.dao.NotificationDao;
import kr.co.ictedu.back.notification.dto.NotificationDTO;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

	@Autowired
	private NotificationDao dao;
	
	private final SseEmitterRepository emitterRepository;

	public NotificationService(SseEmitterRepository emitterRepository) {
		this.emitterRepository = emitterRepository;
	}

	public SseEmitter subscribe(Long memberNum) {

		SseEmitter emitter = new SseEmitter(60L * 60 * 1000);
		emitterRepository.save(memberNum, emitter);
		
		emitter.onCompletion(() -> emitterRepository.delete(memberNum, emitter));
		emitter.onTimeout(() -> emitterRepository.delete(memberNum, emitter));
		emitter.onError((e) -> emitterRepository.delete(memberNum, emitter));
		
		try {
			emitter.send(SseEmitter.event().name("connect").data("connected"));
		} catch (IOException e) {
			emitterRepository.delete(memberNum, emitter);
		}
		return emitter;
	}
	
	public void send(Long memberNum, NotificationDTO notification) {
		List<SseEmitter> memberEmitters = emitterRepository.findAllByMemberNum(memberNum);
		for (SseEmitter emitter : memberEmitters) {
			try {
				emitter.send(SseEmitter.event().name("notification").data(notification));
			} catch (Exception e) {
				emitterRepository.delete(memberNum, emitter); 
			}
		}
	}
	
	public void createNotification(NotificationDTO dto) {
		dao.insertNotification(dto);
		
		send(dto.getMember_num(), dto);
	}
	public List<NotificationDTO> getNotifications(Long memberNum) {
		return dao.getNotifications(memberNum);
	}
	
	public List<NotificationDTO> getUnreadNotifications(Long memberNum) {
		return dao.getUnreadNotifications(memberNum);
	}
	
	public void readNotification(Long memberNum, Long notificationNum) {
		dao.readNotification(memberNum, notificationNum);
	}
	
	public void readAll(Long memberNum) {
		dao.readAll(memberNum);
	}
}