package kr.co.ictedu.back.group.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.group.vo.TagVO;

@Mapper
public interface TagDao {
	
	public List<TagVO> searchTags(String keyword);
}
