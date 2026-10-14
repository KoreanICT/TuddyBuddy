//작성자 : 오진석
package kr.co.ictedu.back.group.dao;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.group.vo.MemoVO;

@Mapper
public interface MemoDao {
	
	void addMemo(MemoVO memovo);
}
