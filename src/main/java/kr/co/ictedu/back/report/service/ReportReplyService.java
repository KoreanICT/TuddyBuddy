// 주용현

package kr.co.ictedu.back.report.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.report.dao.ReportDao;
import kr.co.ictedu.back.report.dao.ReportReplyDao;
import kr.co.ictedu.back.report.vo.ReportReplyVO;
import kr.co.ictedu.back.report.vo.ReportVO;

@Service
public class ReportReplyService {
	
	@Autowired
	private ReportReplyDao reportReplyDao;

	@Autowired
	private ReportDao reportDao;

	@Autowired
	private ReportService reportService;

	@Transactional
	public void add(ReportReplyVO vo) {
		addWithStatus(vo, "COMPLETED");
	}

	@Transactional
	public void addWithStatus(ReportReplyVO vo, String status) {
		ReportVO report = lockReport(vo.getReport_num());
		if (reportReplyDao.countByReport(report.getNum()) > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 답변이 등록된 신고입니다.");
		}
		validateContent(vo);
		reportService.validateTransition(report.getStatus(), status);
		reportReplyDao.add(vo);
		ReportVO statusUpdate = new ReportVO();
		statusUpdate.setNum(report.getNum());
		statusUpdate.setStatus(status);
		if (reportDao.updateStatus(statusUpdate) != 1) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "신고 상태 변경에 실패했습니다.");
		}
	}

	public List<ReportReplyVO> list(Long member_num) {
	    return reportReplyDao.list(member_num);
	}
	
	public ReportReplyVO detail(Long report_num) {
		
		return reportReplyDao.detail(report_num);
	}

	public ReportReplyVO findByNum(Long num) {
		ReportReplyVO reply = reportReplyDao.findByNum(num);
		if (reply == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "신고 답변을 찾을 수 없습니다.");
		}
		return reply;
	}

	@Transactional
	public int update(ReportReplyVO vo) {
		ReportReplyVO reply = findByNum(vo.getNum());
		lockReport(reply.getReport_num());
		findByNum(vo.getNum());
		validateContent(vo);
		vo.setReport_num(reply.getReport_num());
		vo.setAdmin_num(reply.getAdmin_num());
		if (reportReplyDao.update(vo) != 1) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "신고 답변 수정에 실패했습니다.");
		}
		return 1;
	}

	@Transactional
	public int del(Long num) {
		ReportReplyVO reply = findByNum(num);
		lockReport(reply.getReport_num());
		findByNum(num);
		if (reportReplyDao.del(num) != 1) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "신고 답변 삭제에 실패했습니다.");
		}
		return 1;
	}

	private ReportVO lockReport(Long num) {
		ReportVO report = reportDao.lockDetail(num);
		if (report == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "신고를 찾을 수 없습니다.");
		}
		return report;
	}

	private void validateContent(ReportReplyVO vo) {
		if (vo.getContent() == null || vo.getContent().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "답변 내용을 입력해주세요.");
		}
		vo.setContent(vo.getContent().trim());
	}

}
