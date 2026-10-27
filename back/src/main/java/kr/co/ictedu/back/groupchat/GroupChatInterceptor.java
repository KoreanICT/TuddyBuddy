// back/src/main/java/kr/co/ictedu/back/roomchat/RoomChatInterceptor.java
// 추가 예시: CONNECT 인증과 구독·전송 권한을 검사합니다.

package kr.co.ictedu.back.groupchat;

import java.util.List;
import java.util.Map;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import kr.co.ictedu.back.groupchat.service.GroupChatService;
import kr.co.ictedu.back.securityjwt.JwtTokenProvider;

@Component
public class GroupChatInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwt;
    private final GroupChatService service;

    public GroupChatInterceptor(
            JwtTokenProvider jwt,
            GroupChatService service) {
        this.jwt = jwt;
        this.service = service;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (command == StompCommand.CONNECT) {
            String authorization = accessor.getFirstNativeHeader("Authorization");

            if (authorization == null || !authorization.startsWith("Bearer ")) {
                throw new AccessDeniedException("로그인이 필요합니다.");
            }

            String token = authorization.substring(7);

            if (!jwt.validateToken(token)) {
                throw new AccessDeniedException("유효하지 않은 로그인 정보입니다.");
            }

            accessor.setUser(
                new UsernamePasswordAuthenticationToken(
                    jwt.getUsername(token),
                    null,
                    List.of()
                )
            );

            service.requireMember(accessor.getUser());

            Map<String, Object> attributes = accessor.getSessionAttributes();
            if (attributes == null) {
                throw new AccessDeniedException("연결 정보를 확인할 수 없습니다.");
            }
            attributes.put("roomChatToken", token);
        }

        if (command == StompCommand.SUBSCRIBE || command == StompCommand.SEND) {
            Map<String, Object> attributes = accessor.getSessionAttributes();
            Object token = attributes == null
                ? null
                : attributes.get("roomChatToken");

            if (!(token instanceof String)
                    || !jwt.validateToken((String) token)) {
                throw new AccessDeniedException("로그인이 만료되었습니다.");
            }

            // SEND로 /topic에 직접 발행하는 것도 차단합니다.
            String prefix = command == StompCommand.SUBSCRIBE
                ? "/topic/group/"
                : "/app/chat/";

            Long groupNum =
                ChatRoomUtil.getGroupNum(accessor.getDestination(), prefix);

            service.requireGroupMember(groupNum, accessor.getUser());
        }

        return message;
    }
}