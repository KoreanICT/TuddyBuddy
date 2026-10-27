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
import kr.co.ictedu.back.member.service.LoginLogService;
import jakarta.servlet.http.HttpServletRequest;

// Refresh Token 발급·회전·폐기와 로그인 이력 연결을 담당하는 서비스
// Access Token 생성과 브라우저 쿠키 설정은 호출 측에서 별도로 처리
@Service
public class RefreshTokenService {
    // 토큰 유효기간 및 Redis 키 설정

    // 신규 발급·회전된 Refresh Token의 유지기간
    public static final Duration TTL = Duration.ofDays(7);
    // 다른 Redis 데이터와 인증 데이터를 구분하는 키 접두사
    private static final String PREFIX = "tuddy:auth:";
    // 예측하기 어려운 토큰을 생성하는 보안 난수 생성기
    private static final SecureRandom RANDOM = new SecureRandom();

    // Redis 원자적 처리 스크립트
    // Lua 스크립트 안의 비교·변경은 다른 Redis 요청이 중간에 끼어들지 않도록 실행

    // 토큰 저장: 회원의 현재 세대가 발급 시점의 세대와 같을 때만 저장
    // KEYS: 회원 세대 키, 신규 토큰 키 / ARGV: 세대, 저장할 회원정보, 유효기간(초)
    private static final DefaultRedisScript<Long> STORE = new DefaultRedisScript<>(
            "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end; "
            + "redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3]); return 1", Long.class);
    // 토큰 회전: 회원 세대와 기존 토큰 값을 확인한 후 기존 토큰을 삭제하고 신규 토큰 저장
    // 기존 로그인 이력 연결도 신규 토큰으로 이동하며 유효기간을 다시 7일로 설정
    // KEYS: 회원 세대, 기존 토큰, 신규 토큰, 기존 이력 연결, 신규 이력 연결
    // ARGV: 기대하는 세대, 기존 저장값, 신규 유효기간(초)
    private static final DefaultRedisScript<Long> ROTATE = new DefaultRedisScript<>(
            "if redis.call('GET', KEYS[1]) ~= ARGV[1] or redis.call('GET', KEYS[2]) ~= ARGV[2] then return 0 end; "
            + "local history = redis.call('GET', KEYS[4]); "
            + "redis.call('DEL', KEYS[2], KEYS[4]); redis.call('SET', KEYS[3], ARGV[2], 'EX', ARGV[3]); "
            + "if history then redis.call('SET', KEYS[5], history, 'EX', ARGV[3]); end; return 1", Long.class);
    // 로그인 이력 연결: 유효한 토큰의 회원번호를 확인하고 해당 토큰의 남은 TTL만큼 연결 저장
    // KEYS: 토큰 키, 이력 연결 키 / ARGV: 회원번호, 회원번호:로그번호
    private static final DefaultRedisScript<Long> ATTACH_LOG = new DefaultRedisScript<>(
            "local value = redis.call('GET', KEYS[1]); local ttl = redis.call('TTL', KEYS[1]); "
            + "if not value or ttl <= 0 or string.sub(value, 1, string.len(ARGV[1]) + 1) ~= ARGV[1] .. '|' then return 0 end; "
            + "redis.call('SET', KEYS[2], ARGV[2], 'EX', ttl); return 1", Long.class);
    // 개별 토큰 폐기: 토큰과 이력 연결을 함께 삭제하고 종료 처리에 사용할 이력 정보를 반환
    // KEYS: 토큰 키, 이력 연결 키
    private static final DefaultRedisScript<String> REVOKE = new DefaultRedisScript<>(
            "local history = redis.call('GET', KEYS[2]); redis.call('DEL', KEYS[1], KEYS[2]); return history", String.class);

    // 의존성 주입

    // Refresh Token 및 회원별 인증 세대 관리
    private final StringRedisTemplate redis;
    // 토큰 회전 시 실제 회원의 존재와 회원번호 확인
    private final MemberDAO members;
    // 로그인 성공 기록 및 로그아웃 시 이력 종료 처리
    private final LoginLogService loginLogs;

    // 생성자 주입으로 서비스에 필요한 Redis·회원 조회·로그 서비스를 전달받음
    public RefreshTokenService(StringRedisTemplate redis, MemberDAO members, LoginLogService loginLogs) {
        this.redis = redis;
        this.members = members;
        this.loginLogs = loginLogs;
    }

    // 토큰 회전 결과: 재조회한 회원정보와 새 Refresh Token
    // 호출 측은 이 회원정보로 Access Token을 만들고 새 토큰을 쿠키에 설정
    public record Rotation(MemberVO member, String token) { }

    // 신규 Refresh Token 발급
    public String issue(MemberVO member) {
        try {
            String generationKey = generationKey(member.getMember_num());
            // 회원별 인증 세대가 없을 때만 생성. 기존 세대는 유지하여 다른 세션과 공유
            redis.opsForValue().setIfAbsent(generationKey, UUID.randomUUID().toString());
            String generation = redis.opsForValue().get(generationKey);
            // 세대를 확인할 수 없으면 토큰을 발급하지 않고 저장소 오류로 처리
            if (generation == null) throw unavailable();
            // 회원정보·세대를 신규 토큰에 연결하여 Redis에 저장
            return store(member, generation);
        } catch (DataAccessException e) {
            // Redis 접근 장애 등을 인증 저장소 사용 불가 응답으로 변환
            throw unavailable();
        }
    }

    // 기존 Refresh Token 검증 및 새 토큰으로 교체
    public Rotation rotate(String token) {
        // 형식 검사는 Redis 조회 전 수행. 형식이 맞더라도 유효한 토큰이라는 뜻은 아님
        if (!validFormat(token)) throw unauthorized();
        try {
            // 원문 토큰의 SHA-256 해시로 Redis 키를 만들어 저장값 조회
            String value = redis.opsForValue().get(tokenKey(token));
            if (value == null) throw unauthorized();
            // 저장 형식: 회원번호|인증 세대|이메일
            String[] parts = value.split("\\|", 3);
            if (parts.length != 3) throw unauthorized();
            // 이메일로 회원을 재조회하고 저장된 회원번호까지 일치하는지 확인
            MemberVO member = members.getMemberByEmail(parts[2]);
            if (member == null || !String.valueOf(member.getMember_num()).equals(parts[0])) {
                throw unauthorized();
            }
            String successor = randomToken();
            // 회원 조회 이후 Lua에서 세대·토큰을 다시 비교하고 원자적으로 교체
            // 동일 토큰의 동시 회전은 최대 한 요청만 성공하며, 실패·무효화된 요청은 401 처리
            Long rotated = redis.execute(ROTATE,
                    List.of(generationKey(member.getMember_num()), tokenKey(token), tokenKey(successor),
                            logKey(token), logKey(successor)),
                    parts[1], value, Long.toString(TTL.toSeconds()));
            if (!Long.valueOf(1).equals(rotated)) throw unauthorized();
            // 새 토큰만 반환하며 Access Token 발급·쿠키 갱신은 호출 측 책임
            return new Rotation(member, successor);
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    // 개별 Refresh Token 폐기
    public void revoke(String token) {
        // 없거나 형식이 잘못된 토큰은 삭제 대상 없이 종료
        if (!validFormat(token)) return;
        try {
            // Redis의 토큰과 연결 정보를 먼저 삭제한 뒤 로그인 이력 종료
            String history = redis.execute(REVOKE, List.of(tokenKey(token), logKey(token)));
            if (history != null) {
                try {
                    // 연결 정보는 회원번호:로그번호이며 finish에는 로그번호, 회원번호 순서로 전달
                    String[] ids = history.split(":", 2);
                    if (ids.length == 2) loginLogs.finish(Long.valueOf(ids[1]), Long.valueOf(ids[0]));
                } catch (RuntimeException e) {
                    // 이력 종료 실패는 경고만 남기며 이미 수행한 토큰 폐기를 되돌리지 않음
                    LoginLogService.warnUnavailable();
                }
            }
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    // 로그인 성공 기록과 Refresh Token 연결
    // 이력은 보조 기능이므로 기록·연결 실패가 인증 성공을 실패로 바꾸지 않도록 처리
    public void recordLogin(MemberVO member, String token, HttpServletRequest request) {
        try {
            // 요청정보를 포함한 성공 이력을 저장하고 생성된 로그번호를 받음
            Long logNum = loginLogs.success(member, request);
            if (logNum == null) return;
            // 해당 토큰의 잔여 유지기간 동안 회원번호와 로그번호를 연결
            Long attached = redis.execute(ATTACH_LOG, List.of(tokenKey(token), logKey(token)),
                    String.valueOf(member.getMember_num()), member.getMember_num() + ":" + logNum);
            if (!Long.valueOf(1).equals(attached)) LoginLogService.warnUnavailable();
        } catch (RuntimeException e) {
            LoginLogService.warnUnavailable();
        }
    }

    // 회원의 기존 인증 세대 무효화
    public void revokeAll(Long memberNum) {
        try {
            // 회원 세대만 교체해 기존 Refresh Token이 회전 검사를 통과하지 못하도록 처리
            // 토큰 키를 전부 순회·삭제하지 않으며 각 키는 남은 TTL에 따라 자연 만료
            // 이 메서드 자체는 쿠키 삭제나 개별 로그인 이력 종료를 수행하지 않음
            redis.opsForValue().set(generationKey(memberNum), UUID.randomUUID().toString());
        } catch (DataAccessException e) {
            throw unavailable();
        }
    }

    // 신규 토큰 생성 및 Redis 저장 공통 처리
    private String store(MemberVO member, String generation) {
        String token = randomToken();
        // 원문 토큰은 저장값에 넣지 않고 회원번호·세대·이메일을 연결
        String value = member.getMember_num() + "|" + generation + "|" + member.getMember_email();
        // 발급 도중 전체 세대가 변경되면 STORE가 저장을 거절하여 이전 세대 발급 방지
        Long stored = redis.execute(STORE, List.of(generationKey(member.getMember_num()), tokenKey(token)),
                generation, value, Long.toString(TTL.toSeconds()));
        if (!Long.valueOf(1).equals(stored)) throw unauthorized();
        return token;
    }

    // 32바이트(256비트) 난수를 URL에 사용할 수 있는 Base64 문자열로 변환
    // 패딩을 제외하면 43자이며 JWT와 달리 자체 회원정보를 담지 않는 임의 토큰
    private static String randomToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // 토큰의 문자·길이 검사. Redis 존재 여부·세대 검증은 별도로 수행
    private static boolean validFormat(String token) {
        return token != null && token.matches("[A-Za-z0-9_-]{43}");
    }

    // 회원별 인증 세대 키 생성. 세대 키는 만료시간 없이 유지
    private static String generationKey(Long memberNum) {
        return PREFIX + "generation:" + memberNum;
    }

    // 원문 토큰 대신 SHA-256 해시를 포함한 Redis 키 사용
    // 해시는 단방향 처리이며 토큰을 복호화하는 용도가 아님
    private static String tokenKey(String token) {
        try {
            return PREFIX + "refresh:" + HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    // Refresh Token에 연결된 로그인 이력용 Redis 키
    private static String logKey(String token) {
        return tokenKey(token) + ":login-log";
    }

    // 토큰 누락·만료·재사용·세대 불일치 등의 공통 인증 실패 응답
    private static ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
    }

    // 인증 저장소 접근 장애의 공통 503 응답
    // 저장소 장애와 유효하지 않은 토큰의 401 응답을 구분
    public static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "인증 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
}
