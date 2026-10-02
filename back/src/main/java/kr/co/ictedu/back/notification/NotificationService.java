package kr.co.ictedu.back.notification;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    // 연결된 클라이언트 Emitter 목록을 저장 (동시성 처리 safe)
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * SSE 연결 생성
     */
    public SseEmitter subscribe() {
        // 타임아웃 시간 설정 (예: 60초, 기본값은 서버 설정에 따름)
        SseEmitter emitter = new SseEmitter(60 * 1000L);
        this.emitters.add(emitter);

        // 연결 해제/타임아웃 시 목록에서 제거
        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));
        emitter.onError((e) -> this.emitters.remove(emitter));

        // 초기 연결 확인 메시지 전송
        try {
            Map<String, Object> connectionData = new HashMap<>();
            connectionData.put("type", "connection");
            connectionData.put("message", "알림 서비스에 연결되었습니다.");
            connectionData.put("timestamp", LocalDateTime.now().toString());

            emitter.send(SseEmitter.event()
                    .name("connect") // 생략 가능 (기본 message 이벤트)
                    .data(connectionData));
        } catch (IOException e) {
            this.emitters.remove(emitter);
        }

        return emitter;
    }

    /**
     * 모든 클라이언트에게 알림 전송 (sendNotificationToAll)
     */
    public void sendNotificationToAll(Object notificationData) {
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .data(notificationData));
            } catch (IOException e) {
                // 전송 실패한 연결은 제거 목록에 추가
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    /**
     * 테스트용: 5초마다 랜덤 알림 전송 (setInterval 대용)
     */
    @Scheduled(fixedRate = 5000)
    public void sendRandomNotification() {
        if (emitters.isEmpty()) return;

        List<String> messages = Arrays.asList(
                "새로운 메시지가 도착했습니다.",
                "시스템 업데이트가 완료되었습니다.",
                "새로운 댓글이 달렸습니다.",
                "할인 이벤트가 시작되었습니다."
        );

        String randomMessage = messages.get(new Random().nextInt(messages.size()));

        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "notification");
        notification.put("message", randomMessage);
        notification.put("timestamp", LocalDateTime.now().toString());
        notification.put("id", UUID.randomUUID().toString().substring(0, 9));

        sendNotificationToAll(notification);
    }
}