
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
    private static final String DATA_PREFIX = "v2:";

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public KakaoSignupRedisDao(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // 카카오 가입정보
    public record SignupInfo(String kakaoId, String email) {
    }

    // ==========================================
    // 1. 가입용 임시 토큰 생성 및 저장
    // ==========================================
    public String createSignupToken(String kakaoId, String email) {

        if (kakaoId == null || kakaoId.isBlank()) {
            throw new IllegalArgumentException("카카오 ID가 없습니다.");
        }

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        String key = createRedisKey(token);

        String normalizedEmail = email == null
                ? ""
                : email.trim().toLowerCase(java.util.Locale.ROOT);

        // 카카오 ID와 카카오 제공 이메일을 함께 저장
        String data = DATA_PREFIX
                + encode(kakaoId)
                + ":"
                + encode(normalizedEmail);

        redisTemplate.opsForValue().set(
                key,
                data,
                EXPIRE_TIME
        );

        return token;
    }

    // ==========================================
    // 2. 가입정보 조회
    // ==========================================
    public SignupInfo getSignupInfo(String token) {

        if (token == null || token.isBlank()) {
            return null;
        }

        String data = redisTemplate.opsForValue().get(
                createRedisKey(token)
        );

        return parseSignupInfo(data);
    }

    // ==========================================
    // 3. 기존 카카오 ID 조회 기능 유지
    // ==========================================
    public String getKakaoId(String token) {

        SignupInfo info = getSignupInfo(token);

        return info == null ? null : info.kakaoId();
    }

    // ==========================================
    // 4. 카카오 이메일 조회
    // ==========================================
    public String getKakaoEmail(String token) {

        SignupInfo info = getSignupInfo(token);

        return info == null ? null : info.email();
    }

    // ==========================================
    // 5. 가입정보 일회성 소비
    // ==========================================
    public SignupInfo consumeSignupInfo(String token) {

        if (token == null || token.isBlank()) {
            return null;
        }

        // 읽기와 삭제를 원자적으로 수행
        String data = redisTemplate.opsForValue()
                .getAndDelete(createRedisKey(token));

        return parseSignupInfo(data);
    }

    // ==========================================
    // 6. 기존 토큰 소비 기능 유지
    // ==========================================
    public String consumeSignupToken(String token) {

        SignupInfo info = consumeSignupInfo(token);

        return info == null ? null : info.kakaoId();
    }

    // ==========================================
    // 7. Redis 데이터 해석
    // ==========================================
    private SignupInfo parseSignupInfo(String data) {

        if (data == null || data.isBlank()) {
            return null;
        }

        // 이전 방식으로 저장된 토큰도 지원
        if (!data.startsWith(DATA_PREFIX)) {
            return new SignupInfo(data, "");
        }

        String[] parts = data.substring(
                DATA_PREFIX.length()
        ).split(":", -1);

        if (parts.length != 2) {
            throw new IllegalStateException(
                    "카카오 가입정보 형식이 올바르지 않습니다."
            );
        }

        return new SignupInfo(
                decode(parts[0]),
                decode(parts[1])
        );
    }

    // ==========================================
    // 8. 가입정보 인코딩
    // ==========================================
    private String encode(String value) {

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        value.getBytes(StandardCharsets.UTF_8)
                );
    }

    private String decode(String value) {

        return new String(
                Base64.getUrlDecoder().decode(value),
                StandardCharsets.UTF_8
        );
    }

    // ==========================================
    // 9. 토큰 해시를 Redis 키로 변환
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
