package kr.co.ictedu.back.admin.dao;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import kr.co.ictedu.back.group.vo.GroupVO;

@Mapper
public interface StudyAdminDao {
    int count(@Param("keyword") String keyword);
    List<Map<String, Object>> list(@Param("keyword") String keyword, @Param("begin") int begin, @Param("end") int end);
    GroupVO lockGroup(@Param("num") Long num);
    List<Long> memberNums(@Param("num") Long num);
    List<String> documentPaths(@Param("num") Long num);
    int tableExists(@Param("name") String name);
    int deleteChat(@Param("num") Long num);
    int deleteMemos(@Param("num") Long num);
    int deleteSchedules(@Param("num") Long num);
    int deleteTdls(@Param("num") Long num);
    int deleteDiagrams(@Param("num") Long num);
    int deleteDocuments(@Param("num") Long num);
    int deleteTags(@Param("num") Long num);
    int deleteMembers(@Param("num") Long num);
    int deleteJoinRequests(@Param("num") Long num);
    int deleteGroup(@Param("num") Long num);
}
