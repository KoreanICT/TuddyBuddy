package kr.co.ictedu.back.securityauth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@Service
public class RefreshTokenService {
    public static final Duration TTL = Duration.ofDays(7);
    private static final String PREFIX = "tuddy:auth:";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DefaultRedisScript<Long> STORE = new DefaultRedisScript<>(
            "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end; "
            + "redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3]); return 1", Long.class);
    private static final DefaultRedisScript<Long> ROTATE = new DefaultRedisScript<>(
            "if redis.call('GET', KEYS[1]) ~= ARGV[1] or redis.call('GET', KEYS[2]) ~= ARGV[2] then return 0 end; "
            + "redis.call('DEL', KEYS[2]); redis.call('SET', KEYS[3], ARGV[2], 'EX', ARGV[3]); return 1", Long.class);

    private final StringRedisTemplate redis;
    private final MemberDAO members;

    public RefreshTokenService(StringRedisTemplate redis, MemberDAO members) {
        this.redis = redis;
        this.members = members;
    }

    public record Rotation(MemberVO member, String token) { }

    public String issue(MemberVO member) {
        try {
            String generationKey = generationKey(member.getMember_num());
            redis.opsForValue().setIfAbsent(generationKey, UUID.randomUUID().toString());
            String generation = redis.opsForValue().get(generationKey);
            if (generation == null) throw unavailable();
            return store(member, generation);
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    public Rotation rotate(String token) {
        if (!validFormat(token)) throw unauthorized();
        try {
            String value = redis.opsForValue().get(tokenKey(token));
            if (value == null) throw unauthorized();
            String[] parts = value.split("\\|", 3);
            if (parts.length != 3) throw unauthorized();
            MemberVO member = members.getMemberByEmail(parts[2]);
            if (member == null || !String.valueOf(member.getMember_num()).equals(parts[0])) {
                throw unauthorized();
            }
            String successor = randomToken();
            // Query first, then atomically consume and replace. Exactly one concurrent caller succeeds.
            Long rotated = redis.execute(ROTATE,
                    List.of(generationKey(member.getMember_num()), tokenKey(token), tokenKey(successor)),
                    parts[1], value, Long.toString(TTL.toSeconds()));
            if (!Long.valueOf(1).equals(rotated)) throw unauthorized();
            return new Rotation(member, successor);
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    public void revoke(String token) {
        if (!validFormat(token)) return;
        try {
            redis.delete(tokenKey(token));
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    public void revokeAll(Long memberNum) {
        try {
            // Keep the generation key persistent; old token records expire naturally after seven days.
            redis.opsForValue().set(generationKey(memberNum), UUID.randomUUID().toString());
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    private String store(MemberVO member, String generation) {
        String token = randomToken();
        String value = member.getMember_num() + "|" + generation + "|" + member.getMember_email();
        Long stored = redis.execute(STORE, List.of(generationKey(member.getMember_num()), tokenKey(token)),
                generation, value, Long.toString(TTL.toSeconds()));
        if (!Long.valueOf(1).equals(stored)) throw unauthorized();
        return token;
    }

    private static String randomToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static boolean validFormat(String token) {
        return token != null && token.matches("[A-Za-z0-9_-]{43}");
    }

    private static String generationKey(Long memberNum) {
        return PREFIX + "generation:" + memberNum;
    }

    private static String tokenKey(String token) {
        try {
            return PREFIX + "refresh:" + HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
    }

    public static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "인증 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
}
