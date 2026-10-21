//작성자 : 오진석
package kr.co.ictedu.back.group.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.group.dto.MemoListDTO;
import kr.co.ictedu.back.group.vo.MemoVO;

@Mapper
public interface MemoDao {
	
	void addMemo(MemoVO memovo);
	MemoListDTO getMemoById(@Param("memo_num") Long memoNum, @Param("member_num") Long memberNum);
	List<MemoListDTO> getMemos(@Param("group_num") Long memoNum, @Param("member_num") Long memberNum);
	void patchMemo(@Param("memo_num") Long memoNum, @Param("request") MemoVO memovo);
	void deleteMemo(@Param("memo_num") Long memoNum);
}