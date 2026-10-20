// 허승표


package kr.co.ictedu.back.activity.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.activity.vo.ActivityLogVO;

@Mapper
public interface ActivityLogDAO {

	// 활동 로그 한 건 저장
	int insertActivityLog(ActivityLogVO vo);

	// 검색 조건에 맞는 전체 건수
	int countActivityLogs(Map<String, Object> params);
	
	// 검색 조건과 페이지 범위에 맞는 목록
	List<ActivityLogVO> selectActivityLogs(Map<String, Object> params);
}
