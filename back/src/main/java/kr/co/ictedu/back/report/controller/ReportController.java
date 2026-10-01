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

import jakarta.servlet.http.HttpServletRequest;
import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.report.Service.ReportReplyService;
import kr.co.ictedu.back.report.Service.ReportService;
import kr.co.ictedu.back.report.vo.ReportReplyVO;
import kr.co.ictedu.back.report.vo.ReportVO;

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
    @PostMapping("/reportAdd")
    public ResponseEntity<?> reportAdd(@ModelAttribute ReportVO vo) {

        reportService.add(vo);
        return ResponseEntity.ok().body("신고 등록 성공!");
    }
    
    // 신고 목록
    @RequestMapping("/reportList")
    public Map<String, Object> reportList(
            @RequestParam Map<String, String> paramMap,
            HttpServletRequest request) {

        String cPage = paramMap.get("cPage");
        int totalCnt = reportService.totalCount(paramMap);
        PageVO pageVO = pagingService.makePage(totalCnt, cPage);
        Map<String, String> map = new HashMap<>(paramMap);

        map.put(
                "begin",
                String.valueOf(pageVO.getBeginPerPage()));

        map.put(
                "end",
                String.valueOf(pageVO.getEndPerPage()));

        // 페이지에 해당하는 신고 목록
        List<ReportVO> list = reportService.list(map);
        // JSON 응답
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
    @GetMapping("/reportDetail")
    public ReportVO reportDetail(@RequestParam("num") Long num) {

        return reportService.detail(num);
    }
    
    // 신고 수정
    @PutMapping("/reportUpdate")
    public ResponseEntity<?> reportUpdate(@ModelAttribute ReportVO vo) {
        int result = reportService.update(vo);
        return ResponseEntity.ok(result);
    }
    
    // 신고 삭제
    @DeleteMapping("/reportDelete")
    public String reportDelete(
            @RequestParam("num") Long num) {

        reportService.del(num);

        return "삭제 완료";
    }
    
    /* 신고 관리 */

    // 신고 상태 변경
    @PutMapping("/reportStatusUpdate")
    public ResponseEntity<?> reportStatusUpdate(@ModelAttribute ReportVO vo) {
        int result = reportService.updateStatus(vo);
        return ResponseEntity.ok(result);
    }
    
    // 신고 답변 등록
    @PostMapping("/reportReplyAdd")
    public ResponseEntity<?> reportReplyAdd(@ModelAttribute ReportReplyVO vo) {
        reportReplyService.add(vo);
        return ResponseEntity.ok().body("신고 답변 등록 성공!");
    }


    // 신고 답변 조회
    @GetMapping("/reportReplyDetail")
    public ReportReplyVO reportReplyDetail(@RequestParam("report_num") Long report_num) {
        return reportReplyService.detail(report_num);
    }


    // 신고 답변 수정
    @PutMapping("/reportReplyUpdate")
    public ResponseEntity<?> reportReplyUpdate(@ModelAttribute ReportReplyVO vo) {
        int result = reportReplyService.update(vo);
        return ResponseEntity.ok(result);
    }


    // 신고 답변 삭제
    @DeleteMapping("/reportReplyDelete")
    public ResponseEntity<?> reportReplyDelete(@RequestParam("num") Long num) {

        int result = reportReplyService.del(num);

        return ResponseEntity.ok(result);
    }
    
}
