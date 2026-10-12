package kr.co.ictedu.back.group.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.group.dao.GroupDetailDao;
import kr.co.ictedu.back.group.dto.GroupDetailHeaderDTO;

@Service
public class GroupDetailService {

	@Autowired
	private GroupDetailDao dao;
	
	public GroupDetailHeaderDTO getHeader(Long memberNum, Long groupNum) {
		GroupDetailHeaderDTO groupdetailheaderdto = dao.getHeader(memberNum, groupNum);
		return groupdetailheaderdto;
	}
}
