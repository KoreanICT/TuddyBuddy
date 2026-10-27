package kr.co.ictedu.back.group.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.service.OverviewService;

@RestController
@RequestMapping("/api/detail/overview")
public class OverviewController {

	@Autowired
	private OverviewService service;
	
	@GetMapping("/getEvents/{groupNum}")
	public ResponseEntity<Map<String,Object>> getUpcomingSchedules(@PathVariable("groupNum") Long groupNum) {
		return ResponseEntity.ok(service.getUpcomingSchedules(groupNum));
	}
}
