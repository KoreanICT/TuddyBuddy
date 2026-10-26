//작성자 : 오진석
package kr.co.ictedu.back.group.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.group.dto.GroupListDTO;
import kr.co.ictedu.back.group.vo.GroupMemberVO;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;

@Mapper
public interface GroupDao {
	void addGroup(GroupVO groupvo);
	void joinGroup(@Param("group_num") Long groupNum, @Param("member_num") Long memberNum);
	List<TagVO> searchTags(@Param("keyword") String keyword);
	TagVO findTagByName(@Param("tag_name") String tagName);
	void addTag(TagVO tagvo);
	void addGroupTag(@Param("group_num") Long groupNum, @Param("tag_num") Long tagNum);
	void addGroupMember(GroupMemberVO groupMember);
	void getMyGroupsProc(Map<String, Object> params);
	void getPublicGroupsProc(Map<String,Object> params);
	GroupVO findGroupByInviteCode(@Param("invite_code") String inviteCode);
	int countGroupMember(@Param("group_num") Long groupNum, @Param("member_num") Long memberNum);
	int countGroupMembers(@Param("group_num") Long groupNum);
	GroupVO getJoinGroup(@Param("group_num") Long groupNum);
	Long getGroupLeader(@Param("group_num") Long groupNum);
	String getMemberNick(@Param("member_num") Long memberNum);
}
