package kr.co.ictedu.back.report.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.report.dao.ReportDao;
import kr.co.ictedu.back.report.vo.ReportVO;

@Service
public class ReportService {
	
	@Autowired
	private ReportDao reportDao;
	
	public void add(ReportVO vo) {
		reportDao.add(vo);
	}
	
	// 회원별 신고 목록
	public List<ReportVO> myList(Map<String, String> map) {
	    return reportDao.myList(map);
	}

	// 회원별 신고 개수
	public int myTotalCount(Map<String, String> map) {
	    return reportDao.myTotalCount(map);
	}
	
    public List<ReportVO> list(Map<String, String> map) {
        return reportDao.list(map);
    }

    public int totalCount(Map<String, String> map) {
        return reportDao.totalCount(map);
    }

    public ReportVO detail(Long num) {
        return reportDao.detail(num);
    }

    public void del(Long num) {
        reportDao.del(num);
    }

    public int update(ReportVO vo) {
        return reportDao.update(vo);
    }

    public int updateStatus(ReportVO vo) {
        return reportDao.updateStatus(vo);
    }
}
