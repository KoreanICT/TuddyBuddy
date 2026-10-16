// 주용현

package kr.co.ictedu.back.report.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
            @ModelAttribute ReportVO vo) {

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
    public Map<String, Object> myReportList(@RequestParam Map<String, String> paramMap) {
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
    public Map<String, Object> reportList(@RequestParam Map<String, String> paramMap, HttpServletRequest request) {

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
            @RequestParam("num") Long num) {

        return reportService.detail(num);
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
            @ModelAttribute ReportVO vo) {

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
            @RequestParam("num") Long num) {

        reportService.del(num);
        return "삭제 완료";
    }

    /* 신고 관리 */

    // 신고 상태 변경
    @Operation(
        summary = "신고 상태 변경",
        description = "신고 번호와 상태 정보를 이용해 신고 처리 상태를 변경합니다."
    )
    @ApiResponse(responseCode = "200", description = "신고 상태 변경 요청 처리")
    @PutMapping("/reportStatusUpdate")
    public ResponseEntity<?> reportStatusUpdate(
            @Parameter(description = "신고 번호 및 변경할 상태 정보")
            @ModelAttribute ReportVO vo) {

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
            @ModelAttribute ReportReplyVO vo) {

        reportReplyService.add(vo);
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
            @RequestParam("member_num") Long member_num) {

        return reportReplyService.list(member_num);
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
            @RequestParam("report_num") Long report_num) {

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
            @ModelAttribute ReportReplyVO vo) {

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
            @RequestParam("num") Long num) {

        int result = reportReplyService.del(num);
        return ResponseEntity.ok(result);
    }
}
