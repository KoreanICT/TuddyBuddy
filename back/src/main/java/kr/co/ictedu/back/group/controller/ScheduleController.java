package kr.co.ictedu.back.group.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.service.ScheduleService;
import kr.co.ictedu.back.group.vo.ScheduleVO;

@RestController
@RequestMapping("/api/detail/schedule")
public class ScheduleController {

	@Autowired
	private ScheduleService service;
	
	@PostMapping("/addSchedule/{groupNum}")
	public ResponseEntity<String> addSchedule(
			@PathVariable("groupNum") Long groupNum, 
			@RequestHeader("memberNum") Long memberNum, 
			@RequestBody ScheduleVO schedulevo) {
		schedulevo.setGroup_num(groupNum);
		schedulevo.setMember_num(memberNum);
		service.addSchedule(schedulevo);
		
		return ResponseEntity.ok("등록 완료.");
	}
	
	@GetMapping("/getEvents/{groupNum}")
	public ResponseEntity<Map<String, Object>> getEvents(@PathVariable("groupNum") Long groupNum, @RequestHeader("memberNum") Long memberNum) {
		Map<String, Object> map = service.getEvents(groupNum, memberNum);
		return ResponseEntity.ok(map);
	}
	
	@PatchMapping("/updateSchedule/{scheduleNum}")
	public ResponseEntity<String> updateSchedule(@PathVariable("scheduleNum") Long scheduleNum, @RequestBody ScheduleVO schedulevo) {
		service.updateSchedule(scheduleNum, schedulevo);
		
		return ResponseEntity.ok("변경 완료.");
	}
	
	@DeleteMapping("/deleteSchedule/{scheduleNum}")
	public ResponseEntity<String> deleteSchedule(@PathVariable("scheduleNum") Long scheduleNum) {
		service.deleteSchedule(scheduleNum);
		return ResponseEntity.ok("삭제 완료.");
	}
}
