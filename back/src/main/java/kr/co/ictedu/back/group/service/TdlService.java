package kr.co.ictedu.back.group.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.group.dao.TdlDao;
import kr.co.ictedu.back.group.dto.TdlRequestDTO;
import kr.co.ictedu.back.group.vo.TdlVO;

@Service
public class TdlService {
	
	@Autowired
	private TdlDao dao;
	
	@Transactional
	public void addTdl(Long groupNum, Long memberNum,TdlVO tdlvo) {
		tdlvo.setGroup_num(groupNum);
		tdlvo.setMember_num(memberNum);
		
		dao.addTdl(tdlvo);
	}
	
	public List<TdlRequestDTO> getTdls(Long memberNum, Long groupNum) {
		dao.getTdls(groupNum, memberNum);
		
		return dao.getTdls(groupNum,memberNum);
	}
	
	@Transactional
	public void updateExpiredTdl(Long groupNum) {
		dao.updateExpiredTdl(groupNum);
	}
	
	@Transactional
	public void updateTdlStatus(Long tdlNum, String status) {
		dao.updateTdlStatus(tdlNum, status);
	}
	
	@Transactional
	public void deleteTdl(Long tdlNum) {
		dao.deleteTdl(tdlNum);
	}
}
