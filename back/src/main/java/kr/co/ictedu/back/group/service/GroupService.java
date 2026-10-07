package kr.co.ictedu.back.group.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.group.dao.DiagramDao;
import kr.co.ictedu.back.group.dao.GroupDao;
import kr.co.ictedu.back.group.vo.DiagramVO;
import kr.co.ictedu.back.group.vo.GroupVO;

@Service
public class GroupService {

	@Autowired
	private GroupDao dao;
	
	public void addgroup(GroupVO groupvo) {
		dao.addgroup(groupvo);
	}
	
	
}
