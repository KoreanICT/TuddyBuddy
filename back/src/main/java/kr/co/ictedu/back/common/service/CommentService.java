package kr.co.ictedu.back.common.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.common.dao.CommunityDao;

import kr.co.ictedu.back.common.dao.CommentMapper;
import kr.co.ictedu.back.common.vo.CommentVO;
import kr.co.ictedu.back.common.vo.CommunityVO;

@Service
public class CommentService {

    private final CommentMapper commentMapper;
    private final CommunityDao posts;

    public CommentService(CommentMapper commentMapper, CommunityDao posts) {
        this.posts = posts;
        this.commentMapper = commentMapper;
    }

    public List<CommentVO> getComments(int postId) {
        return commentMapper.selectComments(postId);
    }

    @Transactional
    public int createComment(CommentVO comment) {
        if (comment.getPostId() <= 0) throw new IllegalArgumentException("게시글 번호를 확인해주세요.");
        if (posts.lockPost(comment.getPostId()) == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 삭제되었거나 존재하지 않습니다.");

        if (comment.getContent() == null ||
            comment.getContent().trim().isEmpty() || comment.getContent().trim().length() > 250) {

            throw new IllegalArgumentException("댓글은 1~250자로 입력해주세요.");
        }

        comment.setContent(comment.getContent().trim());

        return commentMapper.insertComment(comment);
    }

    public int deleteComment(int commentNum, Long memberNum) {
        return commentMapper.deleteComment(commentNum, memberNum);
    }
    
    public int updateComment(CommunityVO vo, Long memberNum) {
        if (vo.getContent() == null || vo.getContent().isBlank() || vo.getContent().trim().length() > 250) {
            throw new IllegalArgumentException("댓글은 1~250자로 입력해주세요.");
        }
        vo.setContent(vo.getContent().trim());
        return commentMapper.updateComment(vo, memberNum);
    }
	
}