//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.dto.DiagramDTO;
import kr.co.ictedu.back.group.service.DiagramService;
import kr.co.ictedu.back.group.vo.DiagramVO;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/detail/diagram")
public class DiagramController {

	@Autowired
	private DiagramService service;
	
	@PostMapping("/add/{group_num}")
	public ResponseEntity<String> addDiagram(@RequestBody DiagramVO vo, @PathVariable("group_num") Long groupNum) {
		System.out.println(groupNum);
		vo.setGroup_num(groupNum);
		service.addDiagram(vo);
		return ResponseEntity.ok("저장 완료.");
	}
	
	@GetMapping("/getDiagram/{group_num}")
	public ResponseEntity<DiagramDTO> getDiagram(@PathVariable("group_num") Long group_num) {
		DiagramDTO diagramvo = service.getDiagram(group_num);
		return ResponseEntity.ok(diagramvo);
	}
	
}
