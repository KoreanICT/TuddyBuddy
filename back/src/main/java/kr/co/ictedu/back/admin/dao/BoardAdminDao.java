package kr.co.ictedu.back.admin.dao;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BoardAdminDao {
    int count(@Param("keyword") String keyword);
    List<Map<String, Object>> list(@Param("keyword") String keyword,
            @Param("begin") int begin, @Param("end") int end);
    Long lockPost(@Param("num") Long num);
    int deleteComments(@Param("num") Long num);
    int deletePost(@Param("num") Long num);
}
