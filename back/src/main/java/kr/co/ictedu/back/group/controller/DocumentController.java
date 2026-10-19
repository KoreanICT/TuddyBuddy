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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.ictedu.back.group.dto.DocumentListDTO;
import kr.co.ictedu.back.group.service.DocumentService;
import kr.co.ictedu.back.group.vo.DocumentVO;

@Tag(name = "참고 자료", description = "참고자료 등록, 조회, 수정, 삭제 API")
@RestController
@RequestMapping("/api/detail/document")
public class DocumentController {

	@Autowired
	private DocumentService service;
	
	@Operation(summary = "참고자료 등록", description = "참고자료 파일을 서버에 저장하고 DB에 경로 및 다른 데이터를 저장합니다.")
	@ApiResponse(responseCode = "200", description = "참고자료 등록 성공")
	@ApiResponse(responseCode = "500", description = "참고자료 등록 실패")
	@PostMapping("/addDocument/{groupNum}") 
	public ResponseEntity<String> addDocument(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("groupNum") Long groupNum,
            @RequestParam("title") String title,
            @RequestPart("file") MultipartFile file)
            throws IOException {

        service.addDocument(
                groupNum,
                memberNum,
                title,
                file
        );

        return ResponseEntity.ok("저장 완료.");
    }
	
	@Operation(summary = "참고자료 등록", description = "참고자료 파일과 각종 정보 리스트를 DB로부터 조회합니다.")
	@ApiResponse(responseCode = "200", description = "참고자료 리스트 조회 성공")
	@ApiResponse(responseCode = "500", description = "참고자료 리스트 조회 실패")
	@GetMapping("/getDocuments/{groupNum}")
	public ResponseEntity<List<DocumentListDTO>> getDocuments(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("groupNum") Long groupNum)
            throws IOException {

        return ResponseEntity.ok(
                service.getDocuments(groupNum, memberNum)
        );
    }
	
	@Operation(summary = "파일 다운로드", description = "저장된 파일을 DB에서 경로를 추적하여 다운로드 하는 API입니다.")
	@ApiResponse(responseCode = "200", description = "다운로드 성공")
	@ApiResponse(responseCode = "500", description = "다운로드 실패")
	@GetMapping("/download/{documentNum}")
	public ResponseEntity<Resource> downloadDocument(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("documentNum") Long documentNum)
            throws IOException {

        DocumentVO document = service.getDocument(documentNum);

        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(document.getDocument_path());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String encodedFileName = URLEncoder.encode(
                document.getOriginal_name(),
                StandardCharsets.UTF_8
        ).replace("+", "%20");

        service.increaseHit(documentNum);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedFileName
                )
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(Files.size(filePath))
                .body(resource);
    }
	
	@Operation(summary = "수정하기 위한 참고자료 데이터 조회", description = "수정하기 위한 참고자료 데이터를 임시로 DB에서 불러옵니다.")
	@ApiResponse(responseCode = "200", description = "참고자료 조회 성공")
	@ApiResponse(responseCode = "500", description = "참고자료 조회 실패")
	@GetMapping("/getPatchDocument/{documentNum}")
	public ResponseEntity<DocumentVO> getPatchDocument(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("documentNum") Long documentNum) {

        return ResponseEntity.ok(
                service.getPatchDocument(documentNum)
        );
    }
	
	@Operation(summary = "참고자료 수정", description = "참고자료의 데이터를 다시 수정합니다.")
	@ApiResponse(responseCode = "200", description = "참고자료 수정 성공")
	@ApiResponse(responseCode = "500", description = "참고자료 수정 실패")
	@PatchMapping("/patchDocument/{documentNum}")
	public ResponseEntity<String> patchDocument(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("documentNum") Long documentNum,
            @RequestParam("title") String title,
            @RequestPart(
                    value = "file",
                    required = false
            ) MultipartFile file)
            throws IOException {

        service.patchDocument(documentNum, title, file);

        return ResponseEntity.ok("수정 완료.");
    }
	
	@Operation(summary = "참고자료 삭제", description = "참고자료의 데이터를 DB로부터 삭제합니다.")
	@ApiResponse(responseCode = "200", description = "참고자료 삭제 성공")
	@ApiResponse(responseCode = "500", description = "참고자료 삭제 실패")
	@DeleteMapping("/deleteDocument/{documentNum}")
	public ResponseEntity<String> deleteDocument(
            @RequestHeader("memberNum") Long memberNum,
            @PathVariable("documentNum") Long documentNum)
            throws IOException {

        service.deleteDocument(documentNum);

        return ResponseEntity.ok("삭제 완료.");
    }
}