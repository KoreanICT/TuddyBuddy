//작성자 : 오진석
package kr.co.ictedu.back.group.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
	public ResponseEntity<List<DocumentListDTO>> getDocuments(@PathVariable("groupNum") Long groupNum) throws IOException {
		Long memberNum = 1L;
		
		List<DocumentListDTO> list = service.getDocuments(groupNum, memberNum);
		return ResponseEntity.ok(list);
	}
	
	@GetMapping("/download/{documentNum}")
	public ResponseEntity<Resource> downloadDocument(@PathVariable("documentNum") Long documentNum) throws IOException {
		DocumentVO document = service.getDocument(documentNum);
		
		if(document == null) {
			return ResponseEntity.notFound().build();
		}
		
		Path filePath = Paths.get(document.getDocument_path());
		Resource resource = new UrlResource(filePath.toUri());
		
		if(!resource.exists() || !resource.isReadable()) {
			return ResponseEntity.notFound().build();
		}
		
		String encodedFileName = URLEncoder.encode(document.getOriginal_name(),StandardCharsets.UTF_8).replace("+", "%20");
		service.increaseHit(documentNum);
		
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
				.contentType(MediaType.APPLICATION_OCTET_STREAM)
				.contentLength(Files.size(filePath))
				.body(resource);
	}
	@GetMapping("/getPatchDocument/{documentNum}")
	public ResponseEntity<DocumentVO> getPatchDocument(@PathVariable("documentNum") Long documentNum) {
		DocumentVO documentvo = service.getPatchDocument(documentNum);
		return ResponseEntity.ok(documentvo);
	}
	
	@PatchMapping("/patchDocument/{documentNum}")
	public ResponseEntity<String> patchDocument(@PathVariable("documentNum") Long documentNum, @RequestParam("title") String title, @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
		Long memberNum = 1L;
		
		service.patchDocument(documentNum, title, file);
		return ResponseEntity.ok("수정 완료.");
	}
	
	@DeleteMapping("/deleteDocument/{documentNum}")
	public ResponseEntity<String> deleteDocument(@PathVariable("documentNum") Long documentNum) throws IOException {
		service.deleteDocument(documentNum);
		return ResponseEntity.ok("삭제 완료.");
	}
}
