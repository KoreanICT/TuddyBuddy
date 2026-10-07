package kr.co.ictedu.back.group.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.service.GroupService;
import kr.co.ictedu.back.group.vo.GroupVO;

import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/group")
public class GroupController {
	
	@Autowired
	private GroupService service;
	
	@PostMapping("/add")
	public void addgroup(@RequestBody GroupVO groupvo) {
		service.addgroup(groupvo);
	}
	
}
