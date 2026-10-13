//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import kr.co.ictedu.back.group.dto.DocumentListDTO;
import kr.co.ictedu.back.group.service.DocumentService;
import kr.co.ictedu.back.group.vo.DocumentVO;

@RestController
@RequestMapping("/api/detail/document")
public class DocumentController {

	@Autowired
	private DocumentService service;
	
	@PostMapping("/addDocument/{groupNum}") 
	public ResponseEntity<String> addDocument(@PathVariable("groupNum") Long groupNum, @RequestParam("title") String title, @RequestPart("file") MultipartFile file) throws IOException {
		Long memberNum = 1L;
		
		service.addDocument(groupNum, memberNum, title, file);
		return ResponseEntity.ok("저장 완료");
	}
	
	@GetMapping("/getDocuments/{groupNum}")
	public ResponseEntity<List<DocumentListDTO>> getDocuments(@PathVariable("groupNum") Long groupNum) {
		Long memberNum = 1L;
		
		List<DocumentListDTO> list = service.getDocuments(groupNum, memberNum);
		return ResponseEntity.ok(list);
	}
}
