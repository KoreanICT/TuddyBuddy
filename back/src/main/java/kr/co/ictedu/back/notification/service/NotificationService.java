package kr.co.ictedu.back.notification.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import kr.co.ictedu.back.group.dao.GroupDao;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.notification.SseEmitterRepository;
import kr.co.ictedu.back.notification.dao.NotificationDao;
import kr.co.ictedu.back.notification.dto.NotificationDTO;

@Service
public class NotificationService {

	@Autowired
	private GroupDao groupDao;

	private final NotificationDao dao;
	private final SseEmitterRepository emitterRepository;
	private final NotificationPersistenceService persistenceService;

	public NotificationService(NotificationDao dao, SseEmitterRepository emitterRepository,
			NotificationPersistenceService persistenceService) {
		this.dao = dao;
		this.emitterRepository = emitterRepository;
		this.persistenceService = persistenceService;
	}

	public SseEmitter subscribe(Long memberNum) {
		SseEmitter emitter = new SseEmitter(60L * 60 * 1000);

		emitterRepository.save(memberNum, emitter);
		emitter.onCompletion(() -> emitterRepository.delete(memberNum, emitter));
		emitter.onTimeout(() -> emitterRepository.delete(memberNum, emitter));
		emitter.onError(error -> emitterRepository.delete(memberNum, emitter));

		try {
			emitter.send(SseEmitter.event().name("connect").data("connected"));
		} catch (IOException | IllegalStateException e) {
			emitterRepository.delete(memberNum, emitter);
			emitter.completeWithError(e);
		}

		return emitter;
	}

	public void send(Long memberNum, NotificationDTO notification) {
		List<SseEmitter> emitters = emitterRepository.findAllByMemberNum(memberNum);

		for (SseEmitter emitter : emitters) {
			try {
				emitter.send(SseEmitter.event().name("notification").data(notification));
			} catch (IOException | IllegalStateException e) {
				emitterRepository.delete(memberNum, emitter);
				emitter.completeWithError(e);
			}
		}
	}

	public void createNotification(NotificationDTO dto) {
		// 별도 서비스의 트랜잭션 커밋 후 저장 결과를 받습니다.
		NotificationDTO saved = persistenceService.save(dto);

		// DB에서 읽은 ID, 생성 시각, 읽음 상태를 포함해 전송합니다.
		send(saved.getMember_num(), saved);
	}

	public List<NotificationDTO> getNotifications(Long memberNum) {
		return dao.getNotifications(memberNum);
	}

	public List<NotificationDTO> getUnreadNotifications(Long memberNum) {
		return dao.getUnreadNotifications(memberNum);
	}

	public void readNotification(Long memberNum, Long notificationNum) {
		int updated = dao.readNotification(memberNum, notificationNum);

		if (updated == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다.");
		}
	}

	public void readAll(Long memberNum) {
		dao.readAll(memberNum);
	}
	
	public void deleteNotification(Long memberNum, Long notificationNum) {
	    dao.deleteNotification(memberNum, notificationNum);
	}
}