// 허승표

package kr.co.ictedu.back.activity.dao;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.activity.vo.ActivityLogVO;

@Mapper
public interface ActivityLogDAO {

	// 활동 로그 한 건 저장
	int insertActivityLog(ActivityLogVO vo);
}
