package kr.co.ictedu.back.member.service;

import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.Set;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.dao.LoginLogDAO;
import kr.co.ictedu.back.member.vo.LoginLogVO;
import kr.co.ictedu.back.member.vo.MemberVO;

@Service
public class LoginLogService {
    private static final Logger LOG = LoggerFactory.getLogger(LoginLogService.class);
    private final LoginLogWriter writer;
    private final MemberDAO members;
    private final LoginLogDAO logs;

    public LoginLogService(LoginLogWriter writer, MemberDAO members, LoginLogDAO logs) {
        this.writer = writer;
        this.members = members;
        this.logs = logs;
    }

    public record LatestLogin(String lastLoginAt, boolean lookupFailed) { }

    public LatestLogin findLatestSuccessfulLogin(Long memberNum) {
        try {
            return new LatestLogin(logs.findLatestSuccessfulLogin(memberNum), false);
        } catch (RuntimeException e) {
            warnFailure("READ", e);
            return new LatestLogin(null, true);
        }
    }

    public Long success(MemberVO member, HttpServletRequest request) {
        try {
            LoginLogVO record = entry(member, request, "SUCCESS");
            LOG.info("LOGIN_LOG_INSERT_STARTED status=SUCCESS");
            Long logNum = writer.insert(record);
            LOG.info("LOGIN_LOG_INSERTED status=SUCCESS");
            return logNum;
        } catch (RuntimeException e) {
            // Catch outside the transactional proxy, including transaction commit failures.
            warnUnavailable(e);
            return null;
        }
    }

    public void failure(String email, HttpServletRequest request) {
        try {
            // The supplied schema requires a real member_num; unknown accounts cannot be persisted.
            if (email == null || email.isBlank()) {
                LOG.info("LOGIN_LOG_INSERT_SKIPPED status=FAILED");
                return;
            }
            MemberVO member = members.getMemberByEmail(email);
            if (member == null) {
                LOG.info("LOGIN_LOG_INSERT_SKIPPED status=FAILED");
                return;
            }
            LoginLogVO record = entry(member, request, "FAILED");
            LOG.info("LOGIN_LOG_INSERT_STARTED status=FAILED");
            writer.insert(record);
            LOG.info("LOGIN_LOG_INSERTED status=FAILED");
        } catch (RuntimeException e) {
            warnUnavailable(e);
        }
    }

    public void finish(Long logNum, Long memberNum) {
        if (logNum == null || memberNum == null) return;
        try {
            LOG.info("LOGIN_LOG_FINISH_STARTED");
            writer.finish(logNum, memberNum);
            // The writer returns no row count; processed does not claim that a row was updated.
            LOG.info("LOGIN_LOG_FINISH_PROCESSED");
        } catch (RuntimeException e) {
            warnUnavailable(e);
        }
    }

    public static void warnUnavailable() {
        LOG.warn("Login history could not be recorded");
    }

    public static void warnUnavailable(Throwable exception) {
        warnFailure("WRITE", exception);
    }

    private static void warnFailure(String operation, Throwable exception) {
        Set<Throwable> visited = Collections.newSetFromMap(new IdentityHashMap<>());
        Throwable current = exception;
        Throwable cause = exception;
        SQLException sql = null;
        for (int depth = 0; current != null && depth < 8 && visited.add(current); depth++) {
            cause = current;
            if (current instanceof SQLException candidate) sql = candidate;
            current = current.getCause();
        }
        String exceptionClass = exception == null ? "UNKNOWN" : exception.getClass().getSimpleName();
        String causeClass = cause == null ? "UNKNOWN" : cause.getClass().getSimpleName();
        if (sql == null) {
            LOG.warn("LOGIN_LOG_{}_FAILED exceptionClass={} causeClass={}", operation, exceptionClass, causeClass);
        } else {
            String state = sql.getSQLState();
            String safeState = state != null && state.matches("[A-Za-z0-9]{1,5}") ? state : "UNKNOWN";
            LOG.warn("LOGIN_LOG_{}_FAILED exceptionClass={} causeClass={} sqlErrorCode={} sqlState={}",
                    operation, exceptionClass, causeClass, sql.getErrorCode(), safeState);
        }
    }

    private static LoginLogVO entry(MemberVO member, HttpServletRequest request, String status) {
        LoginLogVO entry = new LoginLogVO();
        entry.setMember_num(member.getMember_num());
        entry.setLogin_email(sanitize(member.getMember_email(), 100));
        entry.setLogin_ip(sanitize(request.getRemoteAddr(), 100));
        entry.setLogin_user_agent(sanitize(request.getHeader("User-Agent"), 200));
        entry.setStatus(status);
        return entry;
    }

    private static String sanitize(String value, int maxBytes) {
        if (value == null) return null;
        StringBuilder result = new StringBuilder();
        int bytes = 0;
        for (int offset = 0; offset < value.length();) {
            int point = value.codePointAt(offset);
            offset += Character.charCount(point);
            if (Character.isISOControl(point) || Character.getType(point) == Character.FORMAT
                    || (point <= Character.MAX_VALUE && Character.isSurrogate((char) point))) continue;
            String character = new String(Character.toChars(point));
            int size = character.getBytes(StandardCharsets.UTF_8).length;
            if (bytes + size > maxBytes) break;
            result.append(character);
            bytes += size;
        }
        return result.toString();
    }
}
