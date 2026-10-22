package kr.co.ictedu.back.attendance.controller;

import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.TransactionException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.attendance.service.AttendanceService;
import kr.co.ictedu.back.attendance.service.AttendanceService.AttendanceCheckResponse;
import kr.co.ictedu.back.attendance.vo.AttendanceStatusVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.point.vo.PointVO;

/** 출석 HTTP 요청을 받고 인증된 회원을 확인한 뒤 서비스에 조회·저장을 위임한다. */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    private final AttendanceService attendance;
    private final MemberService members;

    /** 출석 처리와 기존 회원 조회 서비스를 생성자로 주입한다. */
    public AttendanceController(AttendanceService attendance, MemberService members) {
        this.attendance = attendance;
        this.members = members;
    }

    /** 마이페이지 포인트 내역. 클라이언트 회원번호 대신 인증된 본인 번호로 조회한다. */
    @GetMapping("/point-history")
    public List<PointVO> getPointHistory(Authentication authentication) {
        try {
            return attendance.getPointHistory(memberNum(authentication));
        } catch (DataAccessException | TransactionException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "포인트 내역을 조회할 수 없습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /** GET /api/attendance: month 생략 시 DB 한국 날짜의 현재 월을 조회한다. 정상 응답은 200이다. */
    @GetMapping
    public AttendanceStatusVO getMonth(@RequestParam(value = "month", required = false) String month,
            Authentication authentication) {
        try {
            return attendance.getMonth(memberNum(authentication), month);
        } catch (DataAccessException | TransactionException e) {
            throw unavailable();
        }
    }

    /** POST /api/attendance/check: 본문으로 날짜·회원번호를 받지 않으며 저장 성공 시 201을 반환한다. */
    @PostMapping("/check")
    public ResponseEntity<AttendanceCheckResponse> check(Authentication authentication) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(attendance.check(memberNum(authentication)));
        } catch (DataAccessException | TransactionException e) {
            throw unavailable();
        }
    }

    /**
     * JWT 필터가 설정한 인증 이름(이메일)으로 실제 회원번호를 조회한다.
     * 클라이언트가 보낸 회원번호를 신뢰하지 않으며 익명·탈퇴 회원은 401로 거절한다.
     */
    private Long memberNum(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO member = members.getMemberByEmail(authentication.getName());
        if (member == null || member.getMember_num() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 회원 정보를 찾을 수 없습니다.");
        }
        return member.getMember_num();
    }

    /** DB 조회·저장·트랜잭션 장애는 SQL이나 개인정보를 노출하지 않는 공통 503으로 바꾼다. */
    private static ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "출석 저장소를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
}
