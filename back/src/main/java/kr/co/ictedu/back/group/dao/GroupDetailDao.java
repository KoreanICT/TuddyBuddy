//작성자 : 오진석
package kr.co.ictedu.back.group.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.group.dto.GroupDetailHeaderDTO;
import kr.co.ictedu.back.group.dto.GroupUpdateDTO;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;

@Mapper
public interface GroupDetailDao {
	GroupDetailHeaderDTO getHeader(@Param("member_num") Long memberNum, @Param("group_num") Long groupNum);
	GroupVO getDetail(@Param("group_num") Long group_num);
	List<TagVO> getDetailTags(@Param("group_num") Long group_num);
	void addTag(TagVO tagvo);
	void addGroupTag(@Param("group_num") Long groupNum, @Param("tag_num") Long tagNum);
	TagVO findTagByName(@Param("tag_name") String tagName);
	void updateGroup(@Param("group_num") Long groupNum, @Param("request") GroupUpdateDTO request);
	void deleteGroupTags(@Param("group_num") Long groupNum);
}
