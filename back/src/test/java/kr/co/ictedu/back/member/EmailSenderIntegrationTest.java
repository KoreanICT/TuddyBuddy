
package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import kr.co.ictedu.back.member.service.EmailSender;

@SpringBootTest
public class EmailSenderIntegrationTest {

    @Autowired
    private EmailSender emailSender;

    @Autowired
    private StringRedisTemplate redisTemplate;

    // 실제 인증번호 이메일 발송 + Redis 저장 확인
    @Test
    void sendRealEmailTest() {
        // 실제 수신할 이메일 주소로 변경
        String email = "jyh7827@naver.com";

        // 이메일 발송 전에 Redis 연결 확인
        assertNotNull(redisTemplate.getConnectionFactory());
        assertEquals("PONG", redisTemplate.getConnectionFactory().getConnection().ping());

        // 실제 이메일 발송
        emailSender.sendEmail(email);

        // Redis에 저장된 인증코드 조회
        String savedCode = redisTemplate.opsForValue().get(email);

        assertNotNull(savedCode, "Redis에 인증코드가 저장되지 않았습니다.");
        assertTrue(savedCode.matches("[A-Za-z0-9]{6}"), "인증코드 형식이 올바르지 않습니다.");

        Long ttl = redisTemplate.getExpire(email);
        assertNotNull(ttl);
        assertTrue(ttl > 0, "인증코드 만료 시간이 설정되지 않았습니다.");

        System.out.println("이메일 발송 및 Redis 저장 테스트 성공");
        System.out.println("수신 이메일 : " + email);
        System.out.println("Redis 인증코드 : " + savedCode);
        System.out.println("남은 만료 시간 : " + ttl + "초");
    }
}
