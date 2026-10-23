//최솔
package kr.co.ictedu.back.selfstudy.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyCategoryRankingVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyDailyTrendVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudySubjectRankingVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyUsageSummaryVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;

@Mapper
public interface SelfStudyAdminDao {

    List<CategoryVO> selectAllCategories();

    int insertCategory(CategoryVO vo);

    int updateCategoryName(CategoryVO vo);

    int updateCategoryStatus(
            @Param("categoryId") Long categoryId,
            @Param("status") String status);

    int countSubjectsByCategory(@Param("categoryId") Long categoryId);

    int deleteCategory(@Param("categoryId") Long categoryId);

    List<SubjectVO> selectAllSubjects();

    int insertSubject(SubjectVO vo);

    int updateSubjectName(SubjectVO vo);

    int updateSubjectStatus(
            @Param("subjectId") Long subjectId,
            @Param("status") String status);

    SelfStudyUsageSummaryVO selectUsageSummary(
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDateExclusive") java.time.LocalDateTime toDateExclusive);

    List<SelfStudyDailyTrendVO> selectDailyUsageTrend(
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDateExclusive") java.time.LocalDateTime toDateExclusive);

    List<SelfStudyCategoryRankingVO> selectCategoryUsageRanking(
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDateExclusive") java.time.LocalDateTime toDateExclusive);

    List<SelfStudySubjectRankingVO> selectSubjectUsageRanking(
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDateExclusive") java.time.LocalDateTime toDateExclusive);
}
