
package kr.co.ictedu.back.securitykakao;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EmailVerifiedRedisDao {

    private static final String KEY_PREFIX =
            "kakao:email:verified:";

    private static final Duration EXPIRE_TIME =
            Duration.ofMinutes(10);

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public EmailVerifiedRedisDao(
            StringRedisTemplate redisTemplate) {

        this.redisTemplate = redisTemplate;
    }

    // 이메일 인증 증명값 생성
    public String createVerificationToken(String email) {

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        redisTemplate.opsForValue().set(
                createRedisKey(token),
                email.trim().toLowerCase(),
                EXPIRE_TIME
        );

        return token;
    }

    // 인증된 이메일 조회
    public String getVerifiedEmail(String token) {

        if (token == null || token.isBlank()) {
            return null;
        }

        return redisTemplate.opsForValue().get(
                createRedisKey(token)
        );
    }

    // 인증 증명값 일회성 소비
    public String consumeVerificationToken(String token) {

        if (token == null || token.isBlank()) {
            return null;
        }

        return redisTemplate.opsForValue().getAndDelete(
                createRedisKey(token)
        );
    }

    // Redis 키 생성
    private String createRedisKey(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return KEY_PREFIX
                    + Base64.getUrlEncoder()
                            .withoutPadding()
                            .encodeToString(hash);

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "이메일 인증 토큰 해시 생성 실패", e
            );
        }
    }
}
