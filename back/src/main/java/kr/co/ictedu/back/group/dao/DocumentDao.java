//작성자 : 오진석
package kr.co.ictedu.back.group.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.group.dto.DocumentListDTO;
import kr.co.ictedu.back.group.vo.DocumentVO;

@Mapper
public interface DocumentDao {

	void addDocument(DocumentVO documentvo);
	List<DocumentListDTO> getDocuments(DocumentVO documentvo);
}
