
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
public class KakaoSignupRedisDao {

    private static final String KEY_PREFIX = "kakao:signup:";
    private static final Duration EXPIRE_TIME = Duration.ofMinutes(10);

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public KakaoSignupRedisDao(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // ==========================================
    // 1. 가입용 임시 토큰 생성 및 저장
    // ==========================================
    public String createSignupToken(String kakaoId) {

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        String key = createRedisKey(token);

        // 토큰 자체는 저장하지 않고 해시값을 키로 사용
        redisTemplate.opsForValue().set(
                key,
                kakaoId,
                EXPIRE_TIME
        );

        return token;
    }

    // ==========================================
    // 2. 토큰에 연결된 카카오 ID 조회
    // ==========================================
    public String getKakaoId(String token) {

        if (token == null || token.isBlank()) {
            return null;
        }

        return redisTemplate.opsForValue().get(
                createRedisKey(token)
        );
    }

    // ==========================================
    // 3. 토큰을 한 번만 사용하도록 소비
    // ==========================================
    public String consumeSignupToken(String token) {

        if (token == null || token.isBlank()) {
            return null;
        }

        // Redis GETDEL: 읽으면서 삭제하는 원자적 연산
        return redisTemplate.opsForValue().getAndDelete(
                createRedisKey(token)
        );
    }

    // ==========================================
    // 4. 토큰 해시를 Redis 키로 변환
    // ==========================================
    private String createRedisKey(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            String encodedHash = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

            return KEY_PREFIX + encodedHash;

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 해시 생성에 실패했습니다.",
                    e
            );
        }
    }
}
