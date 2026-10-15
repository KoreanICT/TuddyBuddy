//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.ictedu.back.group.dto.DiagramDTO;
import kr.co.ictedu.back.group.service.DiagramService;
import kr.co.ictedu.back.group.vo.DiagramVO;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "다이어그램 API", description = "다이어그램 등록, 상세, 수정 API")
@RestController
@RequestMapping("/api/detail/diagram")
public class DiagramController {

	@Autowired
	private DiagramService service;

	@Operation(summary = "다이어그램 등록", description = "다이어그램 정보와 다이어그램의 좌표, 구성 데이터를 formData 및 Stringified JSON 형태로 저장 및 수정합니다.")
	@ApiResponse(responseCode = "200", description = "다이어그램 등록 성공")
	@ApiResponse(responseCode = "500", description = "다이어그램 등록 실패")
	@PostMapping("/add/{group_num}")
	public ResponseEntity<String> addDiagram(@RequestBody DiagramVO vo, @PathVariable("group_num") Long groupNum) {
		// System.out.println(groupNum);
		vo.setGroup_num(groupNum);
		service.addDiagram(vo);
		return ResponseEntity.ok("저장 완료.");
	}

	@Operation(summary = "다이어그램 조회", description = "저장된 다이어그램의 데이터를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "다이어그램 조회 성공")
	@ApiResponse(responseCode = "500", description = "다이어그램 조회 실패")
	@GetMapping("/getDiagram/{group_num}")
	public ResponseEntity<DiagramDTO> getDiagram(@PathVariable("group_num") Long group_num) {
		DiagramDTO diagramvo = service.getDiagram(group_num);
		return ResponseEntity.ok(diagramvo);
	}

}
