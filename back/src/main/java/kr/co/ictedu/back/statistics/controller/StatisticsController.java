package kr.co.ictedu.back.statistics.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.statistics.service.StatisticsService;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
	
	@Autowired
	private StatisticsService statisticsService;
}
