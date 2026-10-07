package kr.co.ictedu.back.point.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.point.vo.PointVO;

@Mapper
public interface PointDao {
	
	//기존 포인트 조회
	Long select_point(Long num);
	
	List<PointVO> select_point_log(Long num);
	
	void insertPoint(PointVO vo);
	
	void updatePoint(PointVO vo);
	
	

}
