package kr.co.ictedu.back.report.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.report.vo.ReportReplyVO;

@Mapper
public interface ReportReplyDao {

    void add(ReportReplyVO vo);
    
    // 회원 번호로 신고 답변 목록 조회
    List<ReportReplyVO> list(Long member_num);

    // 신고 번호로 답변 조회
    ReportReplyVO detail(Long report_num);

    int update(ReportReplyVO vo);

    int del(Long num);
}
