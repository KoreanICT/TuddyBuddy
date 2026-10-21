package kr.co.ictedu.back.common.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.common.vo.CommunityVO;

@Mapper
public interface CommentMapper {

    List<CommentDao> selectComments(int postId);

    int insertComment(CommentDao comment);

    int deleteComment(int commentNum);
    
    int like(CommunityVO vo);
}