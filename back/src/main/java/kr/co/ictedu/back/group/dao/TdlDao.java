package kr.co.ictedu.back.group.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.group.dto.TdlRequestDTO;
import kr.co.ictedu.back.group.vo.TdlVO;

@Mapper
public interface TdlDao {

	void addTdl(TdlVO tdlvo);
	List<TdlRequestDTO> getTdls(@Param("group_num") Long groupNum, @Param("member_num") Long memberNum);
	void updateExpiredTdl(@Param("group_num") Long groupNum);
	void updateTdlStatus(@Param("tdl_num") Long tdlNum, @Param("status") String status);
	void updateTdl(TdlVO tdlvo);
	void deleteTdl(@Param("tdl_num") Long tdlNum);
}
