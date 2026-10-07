package kr.co.ictedu.back.group.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.group.dao.DiagramDao;
import kr.co.ictedu.back.group.vo.DiagramVO;

@Service
public class DiagramService {

	@Autowired
	private DiagramDao dao;
	public void addDiagram(DiagramVO vo) {
		dao.merge(vo);
	}
	
	public DiagramVO getDiagram(Long group_num) {
		return dao.get(group_num);
	}
	
	public void putDiagram(DiagramVO vo) {
		dao.put(vo);
	}
	
	public void delDiagram(Long group_num) {
		dao.del(group_num);
	}
	
}
