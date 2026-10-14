//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import kr.co.ictedu.back.group.service.MemoService;
import kr.co.ictedu.back.group.vo.MemoVO;

@RestController
@RequestMapping("/api/detail/memo")
public class MemoController {

	@Autowired
	private MemoService service;
	
	@PostMapping("/addMemo/{groupNum}")
	public ResponseEntity<String> addMemo(@PathVariable("groupNum") Long groupNum, @RequestBody MemoVO memovo) {
		Long member_num = 1L;
		
		memovo.setGroup_num(groupNum);
		memovo.setMember_num(member_num);
		service.addMemo(memovo);
		return ResponseEntity.ok("등록 완료.");
	}
}
