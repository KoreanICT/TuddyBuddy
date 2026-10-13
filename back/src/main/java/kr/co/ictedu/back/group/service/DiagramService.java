//작성자 : 오진석
package kr.co.ictedu.back.group.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.group.dao.DiagramDao;
import kr.co.ictedu.back.group.dto.DiagramDTO;
import kr.co.ictedu.back.group.vo.DiagramVO;

@Service
public class DiagramService {

	@Autowired
	private DiagramDao dao;
	
	public void addDiagram(DiagramVO vo) {
		dao.mergeDiagram(vo);
	}
	
	public DiagramDTO getDiagram(Long group_num) {
		return dao.getDiagram(group_num);
	}
}
