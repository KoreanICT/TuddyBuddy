package kr.co.ictedu.back.common.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.common.vo.CommentVO;
import kr.co.ictedu.back.common.vo.CommunityVO;

@Mapper
public interface CommentMapper {

    List<CommentVO> selectComments(int postId);

    int insertComment(CommentVO comment);

    int deleteComment(@Param("commentNum") int commentNum, @Param("memberNum") Long memberNum);
    
    int updateComment(@Param("comment") CommunityVO vo, @Param("memberNum") Long memberNum);
    

}