//작성자 : 오진석
package kr.co.ictedu.back.group.dao;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.group.dto.DiagramDTO;
import kr.co.ictedu.back.group.vo.DiagramVO;

@Mapper
public interface DiagramDao {
	public void mergeDiagram(DiagramVO diagramvo);
	public DiagramDTO getDiagram(Long groupnum);
	
}
