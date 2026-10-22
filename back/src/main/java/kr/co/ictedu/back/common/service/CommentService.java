package kr.co.ictedu.back.common.service;

import java.util.List;

import org.springframework.stereotype.Service;

import kr.co.ictedu.back.common.dao.CommentDao;
import kr.co.ictedu.back.common.dao.CommentMapper;

@Service
public class CommentService {

    private final CommentMapper commentMapper;

    public CommentService(CommentMapper commentMapper) {
        this.commentMapper = commentMapper;
    }

    public List<CommentDao> getComments(int postId) {
        return commentMapper.selectComments(postId);
    }

    public int createComment(CommentDao comment) {

        if (comment.getContent() == null ||
            comment.getContent().trim().isEmpty()) {

            throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        }

        comment.setContent(comment.getContent().trim());

        return commentMapper.insertComment(comment);
    }

    public int deleteComment(int commentNum) {
        return commentMapper.deleteComment(commentNum);
    }
}