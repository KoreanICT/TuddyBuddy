//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.ictedu.back.group.service.TagService;
import kr.co.ictedu.back.group.vo.TagVO;

@Tag(name = "태그 API", description = "태그 조회 API")
@RestController
@RequestMapping("/api/tag")
public class TagController {

	@Autowired
	private TagService service;
	
	@Operation(summary = "태그 조회", description = "태그를 keyword를 통해 조회합니다.")
	@ApiResponse(responseCode = "200", description = "태그 조회 성공")
	@ApiResponse(responseCode = "500", description = "태그 조회 실패")
	@GetMapping("/search")
	public List<TagVO> searchTags(@RequestParam("keyword") String keyword) {
		
		return service.searchTags(keyword);
	}
}
