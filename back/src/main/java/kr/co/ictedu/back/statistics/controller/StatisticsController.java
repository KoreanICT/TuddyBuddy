package kr.co.ictedu.back.statistics.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.statistics.service.StatisticsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
	
	@Autowired
	private StatisticsService statisticsService;
	
	@PostMapping("/getCategories")
	public List<String> getCategories(@RequestBody Map<String, Object> request) {		
	    Long memberNum = ((Number) request.get("memberNum")).longValue();
	    List<String> categorieslist = statisticsService.selectCategories(memberNum);
		return categorieslist;
	}
	
	@PostMapping("/getStatistics")
	public Map<String, Object> getStatistics(@RequestBody Map<String, Object> request) {
		Long memberNum = ((Number) request.get("memberNum")).longValue();
		Map<String, Object> statisticsMap = statisticsService.selectStatistics(memberNum);
		return statisticsMap;
	}
	
	
}
