package kr.co.ictedu.back.notice.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.notice.dao.NoticeDao;
import kr.co.ictedu.back.notice.vo.NoticeVO;

@Service
public class NoticeService {
	
	@Autowired
	private NoticeDao noticeDao;
	
	public void add(NoticeVO vo) {
		noticeDao.add(vo);
		
	}

	public List<NoticeVO> list(Map<String, String> map) {
		return noticeDao.list(map);
	}
	
	public int totalCount(Map<String, String> map) {
		return noticeDao.totalCount(map);
	}
	
	public void hit(int num) {
		noticeDao.hit(num);
	}

	// 상세보기 하기 전에 한번 조회수를 증가 시키기
	public NoticeVO detail(int num) {
		hit(num);
		return noticeDao.detail(num);
	}


	public void del(int num) {
		noticeDao.del(num);
	}
	
	// 수정 대상 조회 (조회수 증가 없음)
	public NoticeVO getNotice(int num) {
	    return noticeDao.detail(num);
	}

	public int update(NoticeVO vo) {
	    return noticeDao.update(vo);
	}
}
