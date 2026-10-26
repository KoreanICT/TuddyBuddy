package kr.co.ictedu.back.group.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.group.service.ScheduleService;
import kr.co.ictedu.back.group.vo.ScheduleVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;

@RestController
@RequestMapping("/api/detail/schedule")
public class ScheduleController {

	@Autowired
	private ScheduleService service;
	
	@Autowired
	private MemberService memberService;
	
	@PostMapping("/addSchedule/{groupNum}")
	public ResponseEntity<String> addSchedule(
			@PathVariable("groupNum") Long groupNum, 
			Authentication authentication, 
			@RequestBody ScheduleVO schedulevo) {
		
		MemberVO member = getMember(authentication);
		
		schedulevo.setGroup_num(groupNum);
		schedulevo.setMember_num(member.getMember_num());
		service.addSchedule(schedulevo);
		
		return ResponseEntity.ok("등록 완료.");
	}
	
	@GetMapping("/getEvents/{groupNum}")
	public ResponseEntity<Map<String, Object>> getEvents(@PathVariable("groupNum") Long groupNum, Authentication authentication) {
		MemberVO member = getMember(authentication);
		
		Map<String, Object> map = service.getEvents(groupNum, member.getMember_num());
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
	
	private MemberVO getMember(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}

		MemberVO member = memberService.getMemberByEmail(authentication.getName());

		if (member == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		return member;
	}
}
