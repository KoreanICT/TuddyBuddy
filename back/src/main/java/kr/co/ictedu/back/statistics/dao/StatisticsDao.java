//김진규
package kr.co.ictedu.back.statistics.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;


@Mapper
public interface StatisticsDao {
	
	// 카테고리 ID와 이름 조회
    List<Map<String, Object>> selectCategories_Statistics(
    		@Param("memberNum") Long memberNum);
    
    // 회원의 모든 카테고리별 풀이 로그 조회
    List<Map<String, Object>> selectQuizLogsByMember_Statistics(
    		@Param("memberNum") Long memberNum);
    
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
