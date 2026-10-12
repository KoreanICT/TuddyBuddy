package kr.co.ictedu.back.group.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.group.dto.GroupDetailHeaderDTO;

@Mapper
public interface GroupDetailDao {
	GroupDetailHeaderDTO getHeader(@Param("member_num") Long memberNum, @Param("group_num") Long groupNum);
}
