package kr.co.ictedu.back.report.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.report.vo.ReportVO;

@Mapper
public interface ReportDao {
    void add(ReportVO vo);
    List<ReportVO> list(Map<String, String> map);
    // 전체 신고 개수
    int totalCount(Map<String, String> map);
    // 신고 상세 조회
    ReportVO detail(Long num);
    int update(ReportVO vo);
    int del(Long num);
    
	/* 신고 관리 */
    // 신고 상태 변경
    int updateStatus(ReportVO vo);
}
