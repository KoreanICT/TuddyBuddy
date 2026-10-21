//최솔
package kr.co.ictedu.back.selfstudy.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyUsageVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;

@Mapper
public interface SelfStudyAdminDao {

    List<CategoryVO> selectAllCategories();

    int insertCategory(CategoryVO vo);

    int updateCategoryName(CategoryVO vo);

    int updateCategoryStatus(
            @Param("categoryId") Long categoryId,
            @Param("status") String status);

    List<SubjectVO> selectAllSubjects();

    int insertSubject(SubjectVO vo);

    int updateSubjectName(SubjectVO vo);

    int updateSubjectStatus(
            @Param("subjectId") Long subjectId,
            @Param("status") String status);

    SelfStudyUsageVO.Summary selectUsageSummary(
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDateExclusive") java.time.LocalDateTime toDateExclusive);

    List<SelfStudyUsageVO.DailyTrend> selectDailyUsageTrend(
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDateExclusive") java.time.LocalDateTime toDateExclusive);

    List<SelfStudyUsageVO.CategoryRanking> selectCategoryUsageRanking(
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDateExclusive") java.time.LocalDateTime toDateExclusive);

    List<SelfStudyUsageVO.SubjectRanking> selectSubjectUsageRanking(
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDateExclusive") java.time.LocalDateTime toDateExclusive);
}
