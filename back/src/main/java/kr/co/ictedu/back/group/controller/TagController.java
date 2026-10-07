package kr.co.ictedu.back.group.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.service.TagService;
import kr.co.ictedu.back.group.vo.TagVO;

@RestController
@RequestMapping("/api/tag")
public class TagController {

	@Autowired
	private TagService service;
	@GetMapping("/search")
	public List<TagVO> searchTags(@RequestParam("keyword") String keyword) {
		
		return service.searchTags(keyword);
	}
}
