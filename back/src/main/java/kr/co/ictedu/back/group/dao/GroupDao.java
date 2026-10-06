package kr.co.ictedu.back.group.dao;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.group.vo.GroupVO;

@Mapper
public interface GroupDao {
	public void addgroup(GroupVO groupvo);
	
}
