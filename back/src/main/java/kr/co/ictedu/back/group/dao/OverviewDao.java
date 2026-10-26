package kr.co.ictedu.back.group.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.group.dto.OverviewScheduleDTO;
import kr.co.ictedu.back.group.dto.OverviewTdlDTO;

@Mapper
public interface OverviewDao {
	List<OverviewScheduleDTO> getUpcomingSchedules(@Param("group_num") Long groupNum);
	List<OverviewTdlDTO> getUpcomingTdls(@Param("group_num") Long groupNum);
	List<Map<String, Object>> getOverviewTdlSummary(@Param("group_num") Long groupNum);
}
