package kr.co.ictedu.back.common.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.common.vo.CommentVO;
import kr.co.ictedu.back.common.vo.CommunityVO;

@Mapper
public interface CommentMapper {

    List<CommentVO> selectComments(int postId);

    int insertComment(CommentVO comment);

    int deleteComment(int commentNum);
    
    int updateComment(CommunityVO vo);
    
    int like(CommunityVO vo);
}