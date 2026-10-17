// 주용현

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
		validateAdd(vo);
		reportDao.add(vo);
	}

	private void validateAdd(ReportVO vo) {
		String type = vo.getType();
		Long targetNum = vo.getTarget_num();
		if (type == null || !List.of("community", "report", "POST", "COMMENT", "USER", "STUDY").contains(type)) {
			throw new IllegalArgumentException("올바른 신고 유형을 선택해주세요.");
		}
		if ("report".equals(type)) {
			if (targetNum == null || targetNum != 0L) {
				throw new IllegalArgumentException("서비스 신고의 대상 번호는 0이어야 합니다.");
			}
		} else if (targetNum == null || targetNum <= 0L || targetNum > 9007199254740991L) {
			throw new IllegalArgumentException("신고 대상 번호는 올바른 양의 정수여야 합니다.");
		}
		if (vo.getCategory() == null || vo.getCategory().isBlank()
				|| vo.getCategory().trim().length() > 255) {
			throw new IllegalArgumentException("신고 사유를 255자 이내로 입력해주세요.");
		}
		if (vo.getContent() == null || vo.getContent().isBlank()) {
			throw new IllegalArgumentException("상세 내용을 입력해주세요.");
		}
		vo.setCategory(vo.getCategory().trim());
		vo.setContent(vo.getContent().trim());
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
