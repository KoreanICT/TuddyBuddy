package kr.co.ictedu.back.common.dao;

import java.util.List;
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
    int increaseViewCount(@Param("id") int id);
    int viewCount(@Param("id") int id);
}
