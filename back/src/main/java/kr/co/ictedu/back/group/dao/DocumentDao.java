//작성자 : 오진석
package kr.co.ictedu.back.group.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.group.dto.DocumentListDTO;
import kr.co.ictedu.back.group.vo.DocumentVO;

@Mapper
public interface DocumentDao {

	void addDocument(DocumentVO documentvo);
	List<DocumentListDTO> getDocuments(DocumentVO documentvo);
	DocumentVO getDocumentById(@Param("document_num") Long documentNum);
	void increaseHit(@Param("document_num") Long documentNum);
	DocumentVO getPatchDocument(@Param("document_num") Long documentNum);
	void deleteDocument(@Param("document_num") Long documentNum);
	void patchDocument(@Param("document_num") Long documentNum, @Param("request") DocumentVO request);
}
