package kr.co.ictedu.back.common.service;

import java.util.List;

import org.springframework.stereotype.Service;

import kr.co.ictedu.back.common.dao.CommentMapper;
import kr.co.ictedu.back.common.vo.CommentVO;
import kr.co.ictedu.back.common.vo.CommunityVO;

@Service
public class CommentService {

    private final CommentMapper commentMapper;

    public CommentService(CommentMapper commentMapper) {
        this.commentMapper = commentMapper;
    }

    public List<CommentVO> getComments(int postId) {
        return commentMapper.selectComments(postId);
    }

    public int createComment(CommentVO comment) {

        if (comment.getContent() == null ||
            comment.getContent().trim().isEmpty()) {

            throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        }

        comment.setContent(comment.getContent().trim());

        return commentMapper.insertComment(comment);
    }

    public int deleteComment(int commentNum, Long memberNum) {
        return commentMapper.deleteComment(commentNum, memberNum);
    }
    
    public int updateComment(CommunityVO vo, Long memberNum) {
        if (vo.getContent() == null || vo.getContent().isBlank()) {
            throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        }
        vo.setContent(vo.getContent().trim());
        return commentMapper.updateComment(vo, memberNum);
    }
	
}