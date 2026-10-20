package kr.co.ictedu.back.attendance.service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.Set;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.attendance.dao.AttendanceDao;
import kr.co.ictedu.back.attendance.vo.AttendanceStatusVO;
import kr.co.ictedu.back.attendance.vo.AttendanceDayVO;

/** 한국 날짜 기준 출석 규칙과 트랜잭션을 담당하며 회원 포인트 잔액은 변경하지 않는다. */
@Service
public class AttendanceService {
    // 다른 유일 제약 오류를 출석 중복으로 오인하지 않도록 출석 전용 제약 이름만 찾는다.
    private static final Pattern DUPLICATE_CONSTRAINT = Pattern.compile(
            "(?i)(?<![A-Z0-9_])UQ_ATTENDANCE_MEMBER_DAY(?![A-Z0-9_])");
    private final AttendanceDao attendance;

    /** MyBatis DAO를 주입받아 SQL 실행을 데이터 계층에 맡긴다. */
    public AttendanceService(AttendanceDao attendance) {
        this.attendance = attendance;
    }

    /**
     * 출석 성공 응답.
     * @param attendanceDate 서버 DB가 정한 출석일(YYYY-MM-DD)
     * @param rewardPoint 이번 출석의 지급 포인트이며 현재 정책은 0
     * @param message 사용자에게 표시할 완료 안내
     */
    public record AttendanceCheckResponse(String attendanceDate, long rewardPoint, String message) { }

    /** 조회 전용 트랜잭션에서 선택 월의 출석 목록과 오늘 출석 여부를 구성한다. */
    @Transactional(readOnly = true)
    public AttendanceStatusVO getMonth(Long memberNum, String requestedMonth) {
        YearMonth requested = requestedMonth == null ? null : parseMonth(requestedMonth);
        // 앱 서버 시간 대신 DB의 Asia/Seoul 날짜를 한 번만 읽어 요청 전체에서 재사용한다.
        LocalDate today = LocalDate.parse(attendance.getToday());
        YearMonth month = requested == null ? YearMonth.from(today) : requested;
        List<AttendanceDayVO> items = attendance.findMonth(memberNum, month.atDay(1).toString());
        // 현재 월은 같은 목록에서 오늘 여부를 계산하여 동시 출석 저장으로 인한 응답 불일치를 피한다.
        // 다른 월을 보고 있을 때는 그 목록에 오늘이 없으므로 오늘 날짜를 별도로 조회한다.
        boolean checkedToday = month.equals(YearMonth.from(today))
                ? items.stream().anyMatch(item -> today.toString().equals(item.getAttendanceDate()))
                : attendance.existsToday(memberNum, today.toString()) > 0;
        return new AttendanceStatusVO(month.toString(), today.toString(), "Asia/Seoul",
                checkedToday, 0L, items);
    }

    /** 출석 저장을 하나의 트랜잭션으로 처리하며 실패하면 저장을 롤백한다. */
    @Transactional
    public AttendanceCheckResponse check(Long memberNum) {
        // 요청 도중 자정이 지나도 처음 읽은 DB 한국 날짜를 저장일과 응답일에 동일하게 사용한다.
        LocalDate today = LocalDate.parse(attendance.getToday());
        try {
            // 사전 조회만으로는 동시 요청을 막을 수 없으므로 DB 회원·날짜 UNIQUE 제약이 최종 판단한다.
            if (attendance.insertToday(memberNum, today.toString()) != 1) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "출석을 저장하지 못했습니다.");
            }
        } catch (DataIntegrityViolationException e) {
            // 해당 출석 제약 위반만 409로 바꾸고 다른 DB 오류는 컨트롤러의 안전한 503 처리로 넘긴다.
            if (isDuplicateDay(e)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "오늘은 이미 출석했습니다.");
            }
            throw e;
        }
        return new AttendanceCheckResponse(today.toString(), 0L, "출석이 완료되었습니다.");
    }

    /** 월 형식과 범위를 검사한다. 월 첫날을 만들어 SQL에 전달하므로 임의 날짜 입력은 사용하지 않는다. */
    private static YearMonth parseMonth(String value) {
        if (!value.matches("[0-9]{4}-(0[1-9]|1[0-2])")) throw invalidMonth();
        try {
            YearMonth month = YearMonth.parse(value);
            // SQL에서 다음 달 경계를 계산할 때 Oracle DATE의 지원 연도 범위를 넘지 않게 제한한다.
            if (month.getYear() < 1 || month.getYear() > 9998) throw invalidMonth();
            return month;
        } catch (DateTimeParseException e) {
            throw invalidMonth();
        }
    }

    /** 잘못된 월 입력을 공통 400 응답으로 표현한다. */
    private static ResponseStatusException invalidMonth() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "월은 0001-01부터 9998-12까지 YYYY-MM 형식으로 입력해주세요.");
    }

    /** 원인 예외를 최대 8단계까지 순환 방어하며 Oracle 코드 1과 출석 전용 제약 이름을 함께 확인한다. */
    private static boolean isDuplicateDay(Throwable exception) {
        Set<Throwable> seen = Collections.newSetFromMap(new IdentityHashMap<>());
        Throwable cause = exception;
        for (int depth = 0; cause != null && depth < 8 && seen.add(cause); depth++, cause = cause.getCause()) {
            if (cause instanceof SQLException sql && sql.getErrorCode() == 1) {
                String metadata = sql.getMessage();
                // 드라이버 오류 내용은 판별에만 사용하며 SQL·예외 원문·식별자를 응답이나 로그에 출력하지 않는다.
                if (metadata != null && DUPLICATE_CONSTRAINT.matcher(metadata).find()) return true;
            }
        }
        return false;
    }
}
