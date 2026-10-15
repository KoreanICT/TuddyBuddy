//김진규
package kr.co.ictedu.back.statistics.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StatisticsDao {
	
	// 카테고리 목록 조회
    List<String> selectCategories_Statistics(
    		@Param("memberNum") Long memberNum);
    
    // 세션id 조회
    Long selectSessionId_Statistics(
    		@Param("memberNum") Long memberNum);
    
    // 정답을 맞춘 문제 목록 조회
    List<Map<String, Object>> selectIncorrectQuizzesByResultId_Statistics(
    		@Param("resultId") Long resultId);
    
    // 히스토리 데이터 조회 (회차별 점수 및 날짜)
    List<Map<String, Object>> selectHistoryStatistics(
    		@Param("memberNum") Long memberNum);

    //  최근 카테고리별 통계 점수 조회
    List<Map<String, Object>> selectCategoryStatisticsList(
    		@Param("memberNum") Long memberNum);

    // 과목별 비중/분포 데이터 조회
    List<Map<String, Object>> selectSubjectShareStatistics(
    		@Param("memberNum") Long memberNum);
}
