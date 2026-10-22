package kr.co.ictedu.back.member.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.member.vo.EmailCountCheckVO;

/** 일반 가입용 이메일 인증 증명. 카카오 가입 토큰과 별도 namespace를 사용합니다. */
@Service
public class SignupEmailVerificationService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PREFIX = "tuddy:signup:email-verified:";
    private static final String TOKEN_FORMAT = "[A-Za-z0-9_-]{43}";
    private static final String TTL_SECONDS = "600";
    // 코드 비교·시도 횟수·코드 소비·증명 발급을 한 번에 처리해 동일 코드의 동시 재사용을 막습니다.
    private static final DefaultRedisScript<Long> VERIFY = new DefaultRedisScript<>(
            "local code = redis.call('GET', KEYS[1]); "
            + "if not code then return -1 end; "
            + "local attempts = tonumber(redis.call('GET', KEYS[2]) or '0'); "
            + "if attempts >= 3 then return -2 end; "
            + "if code ~= ARGV[1] then "
            + "local ttl = redis.call('TTL', KEYS[1]); "
            + "if ttl <= 0 then return -1 end; "
            + "redis.call('SET', KEYS[2], tostring(attempts + 1), 'EX', ttl); return -3 end; "
            + "redis.call('SET', KEYS[3], ARGV[2], 'EX', ARGV[3]); "
            + "redis.call('DEL', KEYS[1], KEYS[2]); return 1", Long.class);
    // 이메일이 일치할 때만 삭제합니다. 동시 가입에서는 한 요청만 증명을 소비할 수 있습니다.
    private static final DefaultRedisScript<Long> CONSUME = new DefaultRedisScript<>(
            "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end; "
            + "redis.call('DEL', KEYS[1]); return 1", Long.class);
    private final StringRedisTemplate redis;

    public SignupEmailVerificationService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public static String normalizeEmail(String email) {
        if (email == null) throw invalidEmail();
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() > 50 || !normalized.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw invalidEmail();
        }
        return normalized;
    }

    public EmailCountCheckVO verifyCode(String email, String code) {
        String normalized = normalizeEmail(email);
        if (code == null || code.isBlank()) return new EmailCountCheckVO(false, "wrong");
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        try {
            Long result = redis.execute(VERIFY, List.of(normalized, normalized + ":attempt", key(token)),
                    code.trim(), normalized, TTL_SECONDS);
            if (Long.valueOf(1).equals(result)) return new EmailCountCheckVO(true, "ok", token);
            if (Long.valueOf(-1).equals(result)) return new EmailCountCheckVO(false, "expired");
            if (Long.valueOf(-2).equals(result)) return new EmailCountCheckVO(false, "exceeded");
            if (Long.valueOf(-3).equals(result)) return new EmailCountCheckVO(false, "wrong");
            throw unavailable();
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    public void consume(String token, String email) {
        String normalized = normalizeEmail(email);
        if (token == null || !token.matches(TOKEN_FORMAT)) throw verificationRequired();
        try {
            if (!Long.valueOf(1).equals(redis.execute(CONSUME, List.of(key(token)), normalized))) {
                throw verificationRequired();
            }
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    private static String key(String token) {
        try {
            return PREFIX + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static ResponseStatusException invalidEmail() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 이메일을 입력해주세요.");
    }

    private static ResponseStatusException verificationRequired() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "이메일 인증이 없거나 만료되었습니다. 다시 인증해주세요.");
    }

    private static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "이메일 인증 저장소를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
}
