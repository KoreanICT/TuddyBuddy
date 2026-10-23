package kr.co.ictedu.back.group.controller;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.dto.TdlRequestDTO;
import kr.co.ictedu.back.group.service.TdlService;
import kr.co.ictedu.back.group.vo.TdlVO;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/detail/tdl")
public class TdlController {

	@Autowired
	private TdlService service;
	
	@PostMapping("/addTdl/{groupNum}")
	public ResponseEntity<String> addTdl(@RequestHeader("memberNum") Long memberNum, @PathVariable("groupNum") Long groupNum, @RequestBody TdlVO tdlvo) {
		service.addTdl(groupNum, memberNum, tdlvo);
		return ResponseEntity.ok("등록 완료.");
	}
	
	@GetMapping("/getTdls/{groupNum}")
	public ResponseEntity<List<TdlRequestDTO>> getMethodName(@RequestHeader("memberNum") Long memberNum, @PathVariable("groupNum") Long groupNum) {
		service.updateExpiredTdl(groupNum);
		List<TdlRequestDTO> list = service.getTdls(memberNum, groupNum);
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
	public ResponseEntity<String> deleteTdl(@RequestHeader("memberNum") Long memberNum, @PathVariable("tdlNum") Long tdlNum) {
		service.deleteTdl(tdlNum);
		return ResponseEntity.ok("삭제 완료.");
	}
}
