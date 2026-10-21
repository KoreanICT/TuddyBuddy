package kr.co.ictedu.back.admin.dao;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DashboardDao {
    Map<String, Object> summary();
    List<Map<String, Object>> recentMembers();
    List<Map<String, Object>> recentPosts();
    List<Map<String, Object>> signupTrend();
    List<Map<String, Object>> reportStatusCounts();
}
