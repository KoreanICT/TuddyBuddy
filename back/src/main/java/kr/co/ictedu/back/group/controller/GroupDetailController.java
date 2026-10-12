package kr.co.ictedu.back.group.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.dto.GroupDetailHeaderDTO;
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
	
}
