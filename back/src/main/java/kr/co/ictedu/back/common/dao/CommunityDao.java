package kr.co.ictedu.back.common.dao;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import kr.co.ictedu.back.common.vo.MyPostVO;

@Mapper
public interface CommunityDao {
    int countMyPosts(@Param("memberNum") Long memberNum);
    List<MyPostVO> findMyPosts(@Param("memberNum") Long memberNum,
            @Param("startRow") int startRow, @Param("endRow") int endRow);
    int countPosts(@Param("category") String category, @Param("keyword") String keyword);
    List<MyPostVO> findPosts(@Param("memberNum") Long memberNum, @Param("category") String category,
            @Param("keyword") String keyword, @Param("startRow") int startRow, @Param("endRow") int endRow);
    int savePost(@Param("post") MyPostVO post, @Param("memberNum") Long memberNum);
    MyPostVO lockPost(@Param("id") int id);
    int updatePost(@Param("id") int id, @Param("memberNum") Long memberNum,
            @Param("title") String title, @Param("content") String content);
    int deletePost(@Param("id") int id, @Param("memberNum") Long memberNum);
    int deleteComments(@Param("id") int id);
    int deleteLikes(@Param("id") int id);
    int deleteViews(@Param("id") int id);
    int hasLike(@Param("id") int id, @Param("memberNum") Long memberNum);
    int addLike(@Param("id") int id, @Param("memberNum") Long memberNum);
    int removeLike(@Param("id") int id, @Param("memberNum") Long memberNum);
    int likeCount(@Param("id") int id);
    int recordView(@Param("id") int id, @Param("memberNum") Long memberNum);
    int increaseViewCount(@Param("id") int id);
    int viewCount(@Param("id") int id);
}
