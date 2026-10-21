package kr.co.ictedu.back.group.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.group.dao.OverviewDao;
import kr.co.ictedu.back.group.dto.OverviewScheduleDTO;
import kr.co.ictedu.back.group.dto.OverviewTdlDTO;

@Service
public class OverviewService {

	@Autowired
	private OverviewDao dao;
	
	public Map<String, Object> getUpcomingSchedules(Long groupNum) {
		Map<String, Object> map = new HashMap<>();
		List<OverviewScheduleDTO> schedulelist = dao.getUpcomingSchedules(groupNum);
		List<OverviewTdlDTO> tdllist = dao.getUpcomingTdls(groupNum);
		List<Map<String, Object>> tdlSummaryList = dao.getOverviewTdlSummary(groupNum);
		
		map.put("schedules", schedulelist);
		map.put("tdls", tdllist);
		map.put("tdlSummary", tdlSummaryList);
		
		return map;
	}
}
