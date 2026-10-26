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

    int deleteCategory(@Param("categoryId") Long categoryId);

    int deleteQuizResponsesByCategory(@Param("categoryId") Long categoryId);

    int deleteResultsByCategory(@Param("categoryId") Long categoryId);

    int deleteQuizzesByCategory(@Param("categoryId") Long categoryId);

    int deleteQuizSessionsByCategory(@Param("categoryId") Long categoryId);

    int deleteSubjectsByCategory(@Param("categoryId") Long categoryId);

    List<SubjectVO> selectAllSubjects();

    int insertSubject(SubjectVO vo);

    int updateSubjectName(SubjectVO vo);

    int updateSubjectStatus(
            @Param("subjectId") Long subjectId,
            @Param("status") String status);

    int deleteQuizResponsesBySubject(@Param("subjectId") Long subjectId);

    int deleteResultsBySubject(@Param("subjectId") Long subjectId);

    int deleteQuizzesBySubject(@Param("subjectId") Long subjectId);

    int deleteQuizSessionsBySubject(@Param("subjectId") Long subjectId);

    int deleteSubject(@Param("subjectId") Long subjectId);

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
