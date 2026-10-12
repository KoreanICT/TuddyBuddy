package kr.co.ictedu.back.group.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import org.apache.ibatis.annotations.Param;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;

@Mapper
public interface GroupDao {
	void addGroup(GroupVO groupvo);
	List<TagVO> searchTags(@Param("keyword") String keyword);
	TagVO findTagByName(@Param("tag_name") String tagName);
	void addTag(TagVO tagvo);
	void addGroupTag(@Param("group_num") Long groupNum, @Param("tag_num") Long tagNum);
}
