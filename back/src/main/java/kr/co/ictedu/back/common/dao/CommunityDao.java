package kr.co.ictedu.back.common.dao;

import kr.co.ictedu.back.common.vo.CommunityVO;
import kr.co.ictedu.back.common.vo.MyPostVO;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper // MyBatis를 사용하는 경우 추가
public interface CommunityDao {

    List<MyPostVO> findMyPosts(@Param("memberNum") Long memberNum,
            @Param("startRow") int startRow, @Param("endRow") int endRow);

    int countMyPosts(@Param("memberNum") Long memberNum);

    int savePost(@Param("post") MyPostVO post, @Param("memberNum") Long memberNum);

    List<MyPostVO> findPosts(@Param("startRow") int startRow, @Param("endRow") int endRow);

    int countPosts();

    // 1. 게시글 쓰기
    int insertPost(CommunityVO communityVO);

    // 2. 게시글 삭제하기
    int deletePost(int id);
    
    // 3. 게시글 수정하기
    int updatePost(CommunityVO vo);

    // 4. 댓글 쓰기 (댓글 정보를 담은 VO나 파라미터 전달)
    int insertComment(@Param("postId") int postId, @Param("comment") CommunityVO commentVO);

    // 5. 댓글 삭제
    int deleteComment(int commentId);
    
    // 7. 임시글 작성 (임시저장 상태 필드가 있다고 가정하거나 별도 컬럼 처리)
    int insertTempPost(CommunityVO communityVO);
    
    // 8. 좋아요 누르기
    int like(CommunityVO vo);
}
