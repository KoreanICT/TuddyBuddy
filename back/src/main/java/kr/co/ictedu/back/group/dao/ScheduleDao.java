package kr.co.ictedu.back.group.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.group.dto.ScheduleDTO;
import kr.co.ictedu.back.group.dto.TdlDTO;
import kr.co.ictedu.back.group.vo.ScheduleVO;

@Mapper
public interface ScheduleDao {

	void addSchedule(ScheduleVO schedulevo);
	List<ScheduleDTO> getSchedules(@Param("group_num") Long groupNum, @Param("member_num") Long member_num);
	List<TdlDTO> getTdls(@Param("group_num") Long groupNum, @Param("member_num") Long member_num);
	void updateSchedule(ScheduleVO schedulevo);
	void deleteSchedule(@Param("schedule_num") Long scheduleNum);
}
