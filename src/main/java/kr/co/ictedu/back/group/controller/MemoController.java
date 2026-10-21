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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.ictedu.back.group.dto.MemoListDTO;
import kr.co.ictedu.back.group.service.MemoService;
import kr.co.ictedu.back.group.vo.MemoVO;
@Tag(name = "메모 API", description = "메모 생성, 조회, 수정, 삭제 API")
@RestController
@RequestMapping("/api/detail/memo")
public class MemoController {

	@Autowired
	private MemoService service;
	
	@Operation(summary = "메모 생성", description = "메모 데이터를 DB에 저장합니다.")
	@ApiResponse(responseCode = "200", description = "메모 데이터 저장 성공")
	@ApiResponse(responseCode = "500", description = "메모 데이터 저장 실패")
	@PostMapping("/addMemo/{groupNum}")
	public ResponseEntity<MemoListDTO> addMemo(@RequestHeader("memberNum") Long memberNum, @PathVariable("groupNum") Long groupNum, @RequestBody MemoVO memovo) {
		
		memovo.setGroup_num(groupNum);
		memovo.setMember_num(memberNum);
		
		MemoListDTO savedMemo = service.addMemo(memovo, memberNum);
		
		return ResponseEntity.ok(savedMemo);
	}
	
	@Operation(summary = "메모 리스트 조회", description = "메모의 데이터가 담긴 리스트를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "메모 리스트 조회 성공")
	@ApiResponse(responseCode = "500", description = "메모 리스트 조회 실패")
	@GetMapping("/getMemos/{groupNum}")
	public ResponseEntity<List<MemoListDTO>> getMemos(@RequestHeader("memberNum") Long memberNum, @PathVariable("groupNum") Long groupNum) {
		Long member_num = 1L;
		List<MemoListDTO> list = service.getMemos(groupNum, member_num);
		return ResponseEntity.ok(list);
	}
	
	@Operation(summary = "메모 내용 수정", description = "메모 내용을 수정합니다.")
	@ApiResponse(responseCode = "200", description = "메모 내용 수정 성공")
	@ApiResponse(responseCode = "500", description = "메모 내용 수정 실패")
	@PatchMapping("/patchMemo/{memoNum}")
	public ResponseEntity<String> patchMemo(@RequestHeader("memberNum") Long memberNum, @PathVariable("memoNum") Long memoNum, @RequestBody MemoVO memovo) {
		service.patchMemo(memoNum, memovo);
		return ResponseEntity.ok("수정 완료");
	}
	
	@Operation(summary = "메모 삭제", description = "메모의 데이터를 DB로부터 삭제합니다.")
	@ApiResponse(responseCode = "200", description = "메모 데이터 삭제 성공")
	@ApiResponse(responseCode = "500", description = "메모 데이터 삭제 실패")
	@DeleteMapping("/deleteMemo/{memoNum}")
	public ResponseEntity<String> deleteMemo(@RequestHeader("memberNum") Long memberNum, @PathVariable("memoNum") Long memoNum) {
		service.deleteMemo(memoNum);
		return ResponseEntity.ok("삭제 완료");
	}
}