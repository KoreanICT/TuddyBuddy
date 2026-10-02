package kr.co.ictedu.back.common.service;

import kr.co.ictedu.back.common.dao.CommunityDao;
import kr.co.ictedu.back.common.vo.CommunityVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional // 데이터 변경 작업이 포함되므로 트랜잭션 처리
public class CommunityService {

    private final CommunityDao communityDao;

    @Autowired
    public CommunityService(CommunityDao communityDao) {
        this.communityDao = communityDao;
    }

    // 1. 게시글 쓰기
    public void writePost(CommunityVO communityVO) {
        int result = communityDao.insertPost(communityVO);
        if (result <= 0) {
            throw new RuntimeException("게시글 작성에 실패했습니다.");
        }
    }

    // 2. 게시글 삭제하기
    public void deletePost(int id) {
        int result = communityDao.deletePost(id);
        if (result <= 0) {
            throw new RuntimeException("게시글 삭제에 실패했습니다.");
        }
    }

    // 3. 댓글 쓰기
    public void writeComment(int postId, CommunityVO commentVO) {
        int result = communityDao.insertComment(postId, commentVO);
        if (result <= 0) {
            throw new RuntimeException("댓글 작성에 실패했습니다.");
        }
    }

    // 4. 댓글 삭제
    public void deleteComment(int commentId) {
        int result = communityDao.deleteComment(commentId);
        if (result <= 0) {
            throw new RuntimeException("댓글 삭제에 실패했습니다.");
        }
    }

    // 5. 임시글 작성
    public void tempSavePost(CommunityVO communityVO) {
        int result = communityDao.insertTempPost(communityVO);
        if (result <= 0) {
            throw new RuntimeException("임시글 저장에 실패했습니다.");
        }
    }
}