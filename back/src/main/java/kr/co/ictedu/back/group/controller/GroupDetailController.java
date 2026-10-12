package kr.co.ictedu.back.group.controller;

import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import kr.co.ictedu.back.group.dto.GroupDetailHeaderDTO;
import kr.co.ictedu.back.group.dto.GroupUpdateDTO;
import kr.co.ictedu.back.group.service.GroupDetailService;
import kr.co.ictedu.back.group.vo.GroupVO;

@RestController
@RequestMapping("/api/group/detail")
public class GroupDetailController {
	
	@Autowired
	private GroupDetailService service;
	
	@GetMapping("/{groupNum}")
	public ResponseEntity<GroupDetailHeaderDTO> getHeader(@PathVariable("groupNum") Long groupNum) {
		Long memberNum = 1L;
		GroupDetailHeaderDTO groupdetailheaderdto = service.getHeader(memberNum, groupNum);
		return ResponseEntity.ok(groupdetailheaderdto);
	}
	
	@GetMapping("/{groupNum}/edit") 
	public ResponseEntity<GroupUpdateDTO> getUpdateData(@PathVariable("groupNum") Long groupNum) {
		GroupUpdateDTO dto = service.getUpdateData(groupNum);
		
		return ResponseEntity.ok(dto);
	}
	
	@PatchMapping(value="/patchGroup/{groupNum}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, Object>> updateGroup(
			@PathVariable("groupNum") Long groupNum, 
			@PathVariable("groupData") GroupUpdateDTO request, 
			@RequestPart(value="thumbnail", required=false) MultipartFile thumbnail) {
		service.updateGroup(groupNum, request, thumbnail);
		Map<String, Object> result = new HashMap<>();
		
		result.put("message", "스터디룸 정보가 수정되었습니다.");
		return ResponseEntity.ok(result);
	}
	
}
