// 주용현

package kr.co.ictedu.back.report.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.securityauth.MemberRoles;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;
import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.report.service.ReportReplyService;
import kr.co.ictedu.back.report.service.ReportService;
import kr.co.ictedu.back.report.vo.ReportReplyVO;
import kr.co.ictedu.back.report.vo.ReportVO;

@Tag(name = "신고 API", description = "신고 등록, 목록, 상세, 수정, 삭제 및 신고 관리, 답변 API")
@RestController
@RequestMapping("/api/report")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportReplyService reportReplyService;

    @Autowired
    private PagingService pagingService;

    @Autowired
    private MemberService memberService;

    private MemberVO loginMember(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO member = memberService.getMemberByEmail(authentication.getName());
        if (member == null || member.getMember_num() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 회원 정보를 찾을 수 없습니다.");
        }
        return member;
    }

    private boolean isManager(MemberVO member) {
        return MemberRoles.isManager(member.getAuthority());
    }

    private MemberVO requireManager(Authentication authentication) {
        MemberVO member = loginMember(authentication);
        if (!isManager(member)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
        }
        return member;
    }

    private ReportVO readableReport(Long num, Authentication authentication) {
        MemberVO member = loginMember(authentication);
        ReportVO report = reportService.detail(num);
        if (!isManager(member) && !member.getMember_num().equals(report.getMember_num())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 신고만 조회하거나 수정할 수 있습니다.");
        }
        return report;
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> reportError(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode()).body(exception.getReason());
    }

    // 신고 등록
    @Operation(
        summary = "신고 등록",
        description = "신고 정보를 등록합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 등록 성공")
    @ApiResponse(responseCode = "400", description = "잘못된 신고 등록 정보")
    @PostMapping("/reportAdd")
    public ResponseEntity<?> reportAdd(
            @Parameter(description = "신고 등록 정보")
            @ModelAttribute ReportVO vo, Authentication authentication) {

        vo.setMember_num(loginMember(authentication).getMember_num());
        try {
            reportService.add(vo);
            return ResponseEntity.ok().body("신고 등록 성공!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 회원별 신고 목록
    @Operation(
        summary = "회원별 신고 목록 조회",
        description = "회원 번호 및 검색 조건으로 해당 회원의 신고 목록을 조회합니다.",
        parameters = {
            @Parameter(name = "member_num", description = "회원 번호", in = ParameterIn.QUERY, example = "1"),
            @Parameter(name = "cPage", description = "현재 페이지 번호", in = ParameterIn.QUERY, example = "1"),
            @Parameter(name = "searchType", description = "검색 유형", in = ParameterIn.QUERY),
            @Parameter(name = "searchValue", description = "검색어", in = ParameterIn.QUERY)
        }
    )
    @ApiResponse(responseCode = "200", description = "회원별 신고 목록 조회 성공")
    @GetMapping("/myReportList")
    public Map<String, Object> myReportList(@RequestParam Map<String, String> paramMap,
            Authentication authentication) {
        paramMap = new HashMap<>(paramMap);
        paramMap.put("member_num", String.valueOf(loginMember(authentication).getMember_num()));
        String cPage = paramMap.get("cPage");

        int totalCnt = reportService.myTotalCount(paramMap);
        PageVO pageVO = pagingService.makePage(totalCnt, cPage);

        Map<String, String> map = new HashMap<>(paramMap);
        map.put("begin", String.valueOf(pageVO.getBeginPerPage()));
        map.put("end", String.valueOf(pageVO.getEndPerPage()));

        List<ReportVO> list = reportService.myList(map);

        Map<String, Object> response = new HashMap<>();
        response.put("data", list);
        response.put("totalItems", pageVO.getTotalRecord());
        response.put("totalPages", pageVO.getTotalPage());
        response.put("currentPage", pageVO.getNowPage());
        response.put("startPage", pageVO.getStartPage());
        response.put("endPage", pageVO.getEndPage());

        return response;
    }

    // 신고 목록
    @Operation(
        summary = "신고 목록 조회",
        description = "페이지 번호 및 검색 조건으로 전체 신고 목록을 조회합니다.",
        parameters = {
            @Parameter(name = "cPage", description = "현재 페이지 번호", in = ParameterIn.QUERY, example = "1"),
            @Parameter(name = "searchType", description = "검색 유형", in = ParameterIn.QUERY),
            @Parameter(name = "searchValue", description = "검색어", in = ParameterIn.QUERY)
        }
    )
    @ApiResponse(responseCode = "200", description = "신고 목록 조회 성공")
    @RequestMapping("/reportList")
    public Map<String, Object> reportList(@RequestParam Map<String, String> paramMap, HttpServletRequest request,
            Authentication authentication) {

        requireManager(authentication);
        String cPage = paramMap.get("cPage");
        int totalCnt = reportService.totalCount(paramMap);
        PageVO pageVO = pagingService.makePage(totalCnt, cPage);
        Map<String, String> map = new HashMap<>(paramMap);

        map.put("begin", String.valueOf(pageVO.getBeginPerPage()));
        map.put("end", String.valueOf(pageVO.getEndPerPage()));

        List<ReportVO> list = reportService.list(map);

        Map<String, Object> response = new HashMap<>();
        response.put("data", list);
        response.put("totalItems", pageVO.getTotalRecord());
        response.put("totalPages", pageVO.getTotalPage());
        response.put("currentPage", pageVO.getNowPage());
        response.put("startPage", pageVO.getStartPage());
        response.put("endPage", pageVO.getEndPage());

        return response;
    }

    // 신고 상세 조회
    @Operation(
        summary = "신고 상세 조회",
        description = "신고 번호(num)를 이용해 신고 상세 정보를 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 상세 조회 성공")
    @GetMapping("/reportDetail")
    public ReportVO reportDetail(
            @Parameter(description = "신고 번호", required = true, example = "1")
            @RequestParam("num") Long num, Authentication authentication) {

        return readableReport(num, authentication);
    }

    // 신고 수정
    @Operation(
        summary = "신고 수정",
        description = "신고 정보를 수정합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 수정 요청 처리")
    @PutMapping("/reportUpdate")
    public ResponseEntity<?> reportUpdate(
            @Parameter(description = "수정할 신고 정보")
            @ModelAttribute ReportVO vo, Authentication authentication) {

        readableReport(vo.getNum(), authentication);
        int result = reportService.update(vo);
        return ResponseEntity.ok(result);
    }

    // 신고 삭제
    @Operation(
        summary = "신고 삭제",
        description = "신고 번호(num)를 이용해 신고 내역을 삭제합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 삭제 요청 처리")
    @DeleteMapping("/reportDelete")
    public String reportDelete(
            @Parameter(description = "삭제할 신고 번호", required = true, example = "1")
            @RequestParam("num") Long num, Authentication authentication) {

        requireManager(authentication);
        reportService.del(num);
        return "삭제 완료";
    }

    /* 신고 관리 */

    @GetMapping("/reportTargetDetail")
    public Map<String, Object> reportTargetDetail(@RequestParam("num") Long num, Authentication authentication) {
        requireManager(authentication);
        return reportService.targetDetail(num);
    }

    // 신고 상태 변경
    @Operation(
        summary = "신고 상태 변경",
        description = "신고 번호와 상태 정보를 이용해 신고 처리 상태를 변경합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 상태 변경 요청 처리")
    @PutMapping("/reportStatusUpdate")
    public ResponseEntity<?> reportStatusUpdate(
            @Parameter(description = "신고 번호 및 변경할 상태 정보")
            @ModelAttribute ReportVO vo, Authentication authentication) {

        requireManager(authentication);
        int result = reportService.updateStatus(vo);
        return ResponseEntity.ok(result);
    }

    // 신고 답변 등록
    @Operation(
        summary = "신고 답변 등록",
        description = "신고에 대한 관리자 답변을 등록합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 답변 등록 성공")
    @PostMapping("/reportReplyAdd")
    public ResponseEntity<?> reportReplyAdd(
            @Parameter(description = "신고 답변 등록 정보")
            @ModelAttribute ReportReplyVO vo,
            @RequestParam(value = "status", defaultValue = "COMPLETED") String status,
            Authentication authentication) {

        vo.setAdmin_num(requireManager(authentication).getMember_num());
        reportReplyService.addWithStatus(vo, status);
        return ResponseEntity.ok().body("신고 답변 등록 성공!");
    }

    // 멤버 번호로 신고 답변 목록 조회
    @Operation(
        summary = "회원별 신고 답변 목록 조회",
        description = "회원 번호(member_num)를 이용해 신고 답변 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 답변 목록 조회 성공")
    @GetMapping("/reportReplyList")
    public List<ReportReplyVO> reportReplyList(
            @Parameter(description = "회원 번호", required = true, example = "1")
            @RequestParam(value = "member_num", required = false) Long member_num,
            Authentication authentication) {

        return reportReplyService.list(loginMember(authentication).getMember_num());
    }

    // 신고 번호로 신고 답변 조회
    @Operation(
        summary = "신고 답변 상세 조회",
        description = "신고 번호(report_num)를 이용해 해당 신고의 답변을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 답변 상세 조회 성공")
    @GetMapping("/reportReplyDetail")
    public ReportReplyVO reportReplyDetail(
            @Parameter(description = "신고 번호", required = true, example = "1")
            @RequestParam("report_num") Long report_num, Authentication authentication) {

        readableReport(report_num, authentication);
        return reportReplyService.detail(report_num);
    }

    // 신고 답변 수정
    @Operation(
        summary = "신고 답변 수정",
        description = "등록된 신고 답변 정보를 수정합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 답변 수정 요청 처리")
    @PutMapping("/reportReplyUpdate")
    public ResponseEntity<?> reportReplyUpdate(
            @Parameter(description = "수정할 신고 답변 정보")
            @ModelAttribute ReportReplyVO vo, Authentication authentication) {

        vo.setAdmin_num(requireManager(authentication).getMember_num());
        int result = reportReplyService.update(vo);
        return ResponseEntity.ok(result);
    }

    // 신고 답변 삭제
    @Operation(
        summary = "신고 답변 삭제",
        description = "신고 답변 번호(num)를 이용해 신고 답변을 삭제합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 답변 삭제 요청 처리")
    @DeleteMapping("/reportReplyDelete")
    public ResponseEntity<?> reportReplyDelete(
            @Parameter(description = "삭제할 신고 답변 번호", required = true, example = "1")
            @RequestParam("num") Long num, Authentication authentication) {

        requireManager(authentication);
        int result = reportReplyService.del(num);
        return ResponseEntity.ok(result);
    }
}
