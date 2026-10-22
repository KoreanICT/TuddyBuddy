package kr.co.ictedu.back.group.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.group.dao.ScheduleDao;
import kr.co.ictedu.back.group.vo.ScheduleVO;

@Service
public class ScheduleService {

	@Autowired
	private ScheduleDao dao;
	
	@Transactional
	public void addSchedule(ScheduleVO schedulevo) {
		dao.addSchedule(schedulevo);
	}
	
	public Map<String, Object> getEvents(Long groupNum, Long memberNum) {
		Map<String, Object> map = new HashMap<>();
		map.put("schedules", dao.getSchedules(groupNum, memberNum));
		map.put("tdls", dao.getTdls(groupNum, memberNum));
		
		return map;
	}
	
	@Transactional
	public void updateSchedule(Long scheduleNum, ScheduleVO schedulevo) {
		schedulevo.setSchedule_num(scheduleNum);
		
		dao.updateSchedule(schedulevo);
	}
	@Transactional
	public void deleteSchedule(Long scheduleNum) {
		dao.deleteSchedule(scheduleNum);
	}
}
