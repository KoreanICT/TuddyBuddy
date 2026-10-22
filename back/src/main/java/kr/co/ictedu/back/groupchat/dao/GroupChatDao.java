package kr.co.ictedu.back.groupchat.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.groupchat.vo.GroupChatVO;

@Mapper
public interface GroupChatDao {

	String getMemberNick(@Param("member_num") Long memberNum);
	int countGroupMember(@Param("group_num") Long group_num, @Param("member_num") Long member_num);
	int insertMessage(GroupChatVO groupchatvo);
	GroupChatVO getMessage(@Param("chat_num") Long chatNum);
	List<GroupChatVO> getHistory(@Param("group_num") Long groupNum, @Param("before_chat_num") Long beforeChatNum);

}
