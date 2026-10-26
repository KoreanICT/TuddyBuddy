package kr.co.ictedu.back.notification.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.notification.dao.NotificationDao;
import kr.co.ictedu.back.notification.dto.NotificationDTO;

@Service
public class NotificationPersistenceService {

    private final NotificationDao dao;

    public NotificationPersistenceService(NotificationDao dao) {
        this.dao = dao;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationDTO save(NotificationDTO dto) {
        int inserted = dao.insertNotification(dto);

        if (inserted != 1) {
            throw new IllegalStateException("알림 저장에 실패했습니다.");
        }

        NotificationDTO saved = dao.getNotification(
            dto.getMember_num(),
            dto.getNotification_num()
        );

        if (saved == null) {
            throw new IllegalStateException(
                "저장된 알림을 조회하지 못했습니다."
            );
        }

        return saved;
    }
}