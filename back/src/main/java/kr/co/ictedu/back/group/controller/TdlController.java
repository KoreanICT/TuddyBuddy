package kr.co.ictedu.back.group.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.group.dto.TdlRequestDTO;
import kr.co.ictedu.back.group.service.TdlService;
import kr.co.ictedu.back.group.vo.TdlVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
@RestController
@RequestMapping("/api/detail/tdl")
public class TdlController {

	@Autowired
	private TdlService service;
	
	@Autowired
	private MemberService memberService;
	
	@PostMapping("/addTdl/{groupNum}")
	public ResponseEntity<String> addTdl(Authentication authentication, @PathVariable("groupNum") Long groupNum, @RequestBody TdlVO tdlvo) {
		MemberVO member = getMember(authentication);
		
		service.addTdl(groupNum, member.getMember_num(), tdlvo);
		return ResponseEntity.ok("등록 완료.");
	}
	
	@GetMapping("/getTdls/{groupNum}")
	public ResponseEntity<List<TdlRequestDTO>> getMethodName(Authentication authentication, @PathVariable("groupNum") Long groupNum) {
		service.updateExpiredTdl(groupNum);
		
		MemberVO member = getMember(authentication);
		
		List<TdlRequestDTO> list = service.getTdls(member.getMember_num(), groupNum);
		return ResponseEntity.ok(list);
	}
	
	@PatchMapping("/patchStatus/{tdlNum}")
	public ResponseEntity<String> updateTdlStatus(@PathVariable("tdlNum") Long tdlNum, @RequestBody TdlVO tdlvo) {
		service.updateTdlStatus(tdlNum, tdlvo.getStatus());
		
		return ResponseEntity.ok("변경 완료.");
	}
	
	@PatchMapping("/patchTdl/{tdlNum}")
	public ResponseEntity<String> updateTdl(@PathVariable("tdlNum") Long tdlNum, @RequestBody TdlVO tdlvo) {
		service.updateTdl(tdlNum, tdlvo);
		return ResponseEntity.ok("TDL 변경 완료.");
	}
	
	@DeleteMapping("/deleteTdl/{tdlNum}")
	public ResponseEntity<String> deleteTdl(@PathVariable("tdlNum") Long tdlNum) {
		service.deleteTdl(tdlNum);
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
