package kr.co.ictedu.back.group.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.group.service.DiagramService;
import kr.co.ictedu.back.group.vo.DiagramVO;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/diagram")
public class DiagramController {

	@Autowired
	private DiagramService service;
	
	@PostMapping("/add")
	public void addDiagram(@RequestBody DiagramVO vo) {
		service.addDiagram(vo);
	}
	
	@GetMapping("/getdiagram")
	public DiagramVO getDiagram(@RequestParam("group_num") Long group_num) {
		DiagramVO diagramvo = service.getDiagram(group_num);
		return diagramvo;
	}
	
	@PutMapping("/put/{group_num}")
	public void putDiagram(@PathVariable Long group_num, @RequestBody DiagramVO diagramvo) {
		service.putDiagram(diagramvo);
	}
	
	@DeleteMapping("/del/{group_num}")
	public void delDiagram(@PathVariable Long group_num) {
		service.delDiagram(group_num);
	}
}
