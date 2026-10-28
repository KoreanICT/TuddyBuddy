package kr.co.ictedu.back.member.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.securityauth.RefreshTokenService;

@Service
public class AccountRecoveryService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PREFIX = "tuddy:recovery:";
    private static final DefaultRedisScript<Long> LIMIT = new DefaultRedisScript<>(
            "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 3600) end; return n", Long.class);
    private static final DefaultRedisScript<String> VERIFY = new DefaultRedisScript<>(
            "local v = redis.call('GET', KEYS[1]); if not v then return '' end; "
            + "local n = tonumber(redis.call('GET', KEYS[2]) or '0'); if n >= 5 then return '' end; "
            + "if string.sub(v, 1, 64) ~= ARGV[1] then "
            + "redis.call('INCR', KEYS[2]); redis.call('EXPIRE', KEYS[2], 300); return '' end; "
            + "redis.call('DEL', KEYS[1], KEYS[2]); return string.sub(v, 66)", String.class);
    private final MemberDAO members;
    private final StringRedisTemplate redis;
    private final EmailSender mail;
    private final PasswordEncoder encoder;
    private final RefreshTokenService refreshTokens;

    public AccountRecoveryService(MemberDAO members, StringRedisTemplate redis, EmailSender mail,
            PasswordEncoder encoder, RefreshTokenService refreshTokens) {
        this.members = members;
        this.redis = redis;
        this.mail = mail;
        this.encoder = encoder;
        this.refreshTokens = refreshTokens;
    }

    public void limit(String action, String address, int maximum) {
        Long count = redis.execute(LIMIT, List.of(PREFIX + "limit:" + action + ":" + digest(address)));
        if (count == null || count > maximum) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "요청이 많습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    public List<String> findEmails(String name, String phone) {
        if (name == null || name.isBlank() || name.trim().length() > 50 || phone == null
                || !phone.matches("[0-9 ()+\\-]{9,25}")) {
            throw new IllegalArgumentException("가입한 이름과 휴대전화번호를 입력해주세요.");
        }
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() < 9 || digits.length() > 15) throw new IllegalArgumentException("휴대전화번호를 확인해주세요.");
        return members.findRecoveryEmails(name.trim(), digits).stream().map(AccountRecoveryService::maskEmail).distinct().toList();
    }

    public void sendCode(String email) {
        String normalized = SignupEmailVerificationService.normalizeEmail(email);
        String key = challengeKey(normalized);
        if (!Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(key + ":cooldown", "1", Duration.ofSeconds(60)))) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "인증번호 재발송은 60초 후 가능합니다.");
        }
        limit("email", normalized, 5);
        MemberVO member = members.getMemberByEmail(normalized);
        // 존재 여부와 소셜 가입 여부는 인증 전 응답에 드러내지 않습니다.
        if (!localAccount(member)) return;
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        redis.opsForValue().set(key, digest(code) + ":" + digest(member.getMember_pwd()), Duration.ofMinutes(5));
        redis.delete(key + ":attempts");
        try {
            mail.sendRecoveryMail(normalized, "TuddyBuddy 비밀번호 찾기 인증번호",
                    "인증번호는 " + code + " 입니다. 5분 이내에 입력해주세요. 본인이 요청하지 않았다면 무시해주세요.");
        } catch (RuntimeException e) {
            redis.delete(key);
            throw e;
        }
    }

    @Transactional
    public void resetPassword(String email, String code) {
        String normalized = SignupEmailVerificationService.normalizeEmail(email);
        if (code == null || !code.matches("[0-9]{6}")) throw invalidCode();
        String key = challengeKey(normalized);
        String snapshot = redis.execute(VERIFY, List.of(key, key + ":attempts"), digest(code));
        if (snapshot == null || snapshot.isEmpty()) throw invalidCode();
        MemberVO found = members.getMemberByEmail(normalized);
        if (!localAccount(found)) throw invalidCode();
        MemberVO member = members.lockMemberByNum(found.getMember_num());
        if (!localAccount(member) || !snapshot.equals(digest(member.getMember_pwd()))) throw invalidCode();
        String password = "Tb9!" + randomCharacters(16);
        if (members.updatePasswordIfUnchanged(member.getMember_num(), encoder.encode(password), member.getMember_pwd()) != 1) {
            throw invalidCode();
        }
        refreshTokens.revokeAll(member.getMember_num());
        // 메일 발송 실패 시 비밀번호 DB 변경도 롤백합니다. 인증번호는 재발급해야 합니다.
        mail.sendRecoveryMail(normalized, "TuddyBuddy 새 비밀번호 안내",
                "새 비밀번호: " + password + "\n로그인 후 회원정보 수정에서 비밀번호를 변경해주세요.");
    }

    private static boolean localAccount(MemberVO member) {
        return member != null && !"KAKAO".equalsIgnoreCase(member.getMember_login_type())
                && member.getMember_pwd() != null && !member.getMember_pwd().isBlank();
    }
    private static String challengeKey(String email) { return PREFIX + "code:" + digest(email); }
    private static String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at < 1) return "***";
        int visible = Math.min(2, Math.max(0, at - 1));
        return email.substring(0, visible) + "***" + email.substring(at);
    }
    private static String randomCharacters(int length) {
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < length; i++) result.append(alphabet.charAt(RANDOM.nextInt(alphabet.length())));
        return result.toString();
    }
    private static String digest(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    private static ResponseStatusException invalidCode() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증번호가 틀렸거나 만료되었습니다. 다시 인증해주세요.");
    }
}
