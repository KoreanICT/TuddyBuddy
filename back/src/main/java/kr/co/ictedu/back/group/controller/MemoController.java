//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.dto.MemoListDTO;
import kr.co.ictedu.back.group.service.MemoService;
import kr.co.ictedu.back.group.vo.MemoVO;

@RestController
@RequestMapping("/api/detail/memo")
public class MemoController {

	@Autowired
	private MemoService service;
	
	@PostMapping("/addMemo/{groupNum}")
	public ResponseEntity<MemoListDTO> addMemo(@PathVariable("groupNum") Long groupNum, @RequestBody MemoVO memovo) {
		Long member_num = 1L;
		
		memovo.setGroup_num(groupNum);
		memovo.setMember_num(member_num);
		
		MemoListDTO savedMemo = service.addMemo(memovo, member_num);
		
		return ResponseEntity.ok(savedMemo);
	}
	
	@GetMapping("/getMemos/{groupNum}")
	public ResponseEntity<List<MemoListDTO>> getMemos(@PathVariable("groupNum") Long groupNum) {
		Long member_num = 1L;
		List<MemoListDTO> list = service.getMemos(groupNum, member_num);
		return ResponseEntity.ok(list);
	}
	
	@PatchMapping("/patchMemo/{memoNum}")
	public ResponseEntity<String> patchMemo(@PathVariable("memoNum") Long memoNum, @RequestBody MemoVO memovo) {
		Long member_num = 1L;
		service.patchMemo(memoNum, memovo);
		return ResponseEntity.ok("수정 완료");
	}
	
	@DeleteMapping("/deleteMemo/{memoNum}")
	public ResponseEntity<String> deleteMemo(@PathVariable("memoNum") Long memoNum) {
		service.deleteMemo(memoNum);
		return ResponseEntity.ok("삭제 완료");
	}
}
