//김진규
package kr.co.ictedu.back.statistics.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.ictedu.back.statistics.service.StatisticsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "평가분석 API", description = "시험성적 프리빙,llm평가 API")
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
	
	@Autowired
	private StatisticsService statisticsService;
	
	@PostMapping("/getCategories")
	public List<String> getCategories(@RequestBody Map<String, Object> request) {		
		System.out.println("카테고리 테스트"+(Number) request.get("memberNum"));
	    Long memberNum = ((Number) request.get("memberNum")).longValue();
	    List<String> categorieslist = statisticsService.selectCategories(memberNum);
		return categorieslist;
	}
	
	@PostMapping("/getStatistics")
	public Map<String, Object> getStatistics(@RequestBody Map<String, Object> request) {
		System.out.println("평가분석 테스트");
		Long memberNum = ((Number) request.get("memberNum")).longValue();
		Map<String, Object> statisticsMap = statisticsService.selectStatistics(memberNum);
		System.out.println("statisticsMap: " + statisticsMap);
		return statisticsMap;
	}
	
	
}
