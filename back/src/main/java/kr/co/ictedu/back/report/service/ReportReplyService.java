package kr.co.ictedu.back.report.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.report.dao.ReportReplyDao;
import kr.co.ictedu.back.report.vo.ReportReplyVO;

@Service
public class ReportReplyService {
	
	@Autowired
	private ReportReplyDao reportReplyDao;

	public void add(ReportReplyVO vo) {
		reportReplyDao.add(vo);
	}

	public List<ReportReplyVO> list(Long member_num) {
	    return reportReplyDao.list(member_num);
	}
	
	public ReportReplyVO detail(Long report_num) {
		
		return reportReplyDao.detail(report_num);
	}

	public int update(ReportReplyVO vo) {
		
		return reportReplyDao.update(vo);
	}

	public int del(Long num) {
		
		return reportReplyDao.del(num);
	}

}
