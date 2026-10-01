package kr.co.ictedu.back.notice.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.notice.service.NoticeService;
import kr.co.ictedu.back.notice.vo.NoticeVO;


@RestController
@RequestMapping("/api/notice")
public class NoticeController {
	@Autowired
	private NoticeService noticeService;
	
	@Autowired
	private PagingService pagingService;
	
	// @Value : application.properties의 key값으로 설정값을 가져와서 변수에 저장한다.
	// Properties prop = new Properties();
	// prop.load(new FileReader(application.properties))
	// prop.getProperty(key):value
	@Value("${spring.servlet.multipart.location}")
	private String filePath;
	
	@GetMapping("/getPath")
	public String getMethodName() {
		System.out.println("Path  : " + filePath);
		return filePath;
	}
	
	@PostMapping("/noticeAdd")
	public ResponseEntity<?> upboardAdd(
	        NoticeVO vo,
	        HttpServletRequest request) {
		
	    // 업로드 파일
	    MultipartFile mf = vo.getMfile();

	    String oriFn = mf.getOriginalFilename();

	    System.out.println("파일 이름 : " + oriFn);

	    // 업로드 디렉터리 경로
	    Path uploadDir = Paths.get(filePath);
	    try {
	        // 디렉터리가 없다면 생성
	        if (!Files.exists(uploadDir)) {
	            Files.createDirectories(uploadDir);
	        }
	        // 실제 저장할 파일 경로
	        Path savePath = uploadDir.resolve(oriFn);
	        // MultipartFile → 실제 파일 저장
	        mf.transferTo(savePath);
	        // DB에 저장할 파일명
	        vo.setImgn(oriFn);
	        // DB 저장
	        noticeService.add(vo);
	    } catch (Exception e) {
	        e.printStackTrace();

	        return ResponseEntity
	                .internalServerError()
	                .body("업로드 실패");
	    }

	    return ResponseEntity
	            .ok()
	            .body("공지 등록 성공!");
	}
	

	@RequestMapping("/noticeList")
	public Map<String, Object> upBoardList(
			@RequestParam Map<String, String> paramMap, 
			HttpServletRequest request
			) {
		// 현재 페이지에 따라 페이지 공식에 의해서 begin , end를 구해서
		// 페이징 처리되어서 반환 받은 데이터
		
		String cPage = paramMap.get("cPage");
		System.out.println("searchType : " + paramMap.get("searchType"));
		System.out.println("searchValue : " + paramMap.get("searchValue"));
		System.out.println("*************************");
		int totalCnt = noticeService.totalCount(paramMap);
		PageVO pageVO = pagingService.makePage(totalCnt, cPage);
		
		// Json으로 응답 처리 - 페이징 처리된 결과 리스트와 정보
		Map<String, String> map = new HashMap<>(paramMap);
		map.put("begin", String.valueOf(pageVO.getBeginPerPage()));
		map.put("end", String.valueOf(pageVO.getEndPerPage()));
		List<NoticeVO> list = noticeService.list(map);
		

		
		Map<String, Object> response = new HashMap<>();
		response.put("data", list); // 페이징 처리가 완료된 리스트를 저장한 데이터
		response.put("totalItems", pageVO.getTotalRecord()); // 전체 게시물의 count
		response.put("totalPages", pageVO.getTotalPage()); // 전체 페이지
		response.put("currentPage", pageVO.getNowPage()); // 현재 페이지
		response.put("startPage", pageVO.getStartPage()); // 블록의 시작
		response.put("endPage", pageVO.getEndPage()); // 블록의 끝
		
		return response;
	}
	
	
	@GetMapping("/noticeDetail")
	public NoticeVO boardDetail(@RequestParam("num") Long num) {
		return noticeService.detail(num);
	}
	
	
	
	@DeleteMapping("/noticeDelete")
	public String boardDelete(@RequestParam("num") Long num) {
		noticeService.del(num);
		return "삭제 완료";
	}
	
	@PutMapping("/noticeUpdate")
	public ResponseEntity<?> noticeUpdate(
	        @ModelAttribute NoticeVO vo,
	        @RequestParam(value = "deleteImage", defaultValue = "false") boolean deleteImage) {
	    // 1. 기존 공지사항 조회 (조회수 증가 없음)
	    NoticeVO oldNotice = noticeService.getNotice(vo.getNum());
	    if (oldNotice == null) {
	        return ResponseEntity.notFound().build();
	    }
	    // 기존 이미지 파일명
	    String oldImgn = oldNotice.getImgn();
	    vo.setImgn(oldImgn);
	    MultipartFile mf = vo.getMfile();
	    Path uploadDir = Paths.get(filePath);

	    // 새로 저장한 이미지 경로
	    Path newFilePath = null;

	    try {
	        // 2. 새 이미지가 있는 경우
	        if (mf != null && !mf.isEmpty()) {
	            Files.createDirectories(uploadDir);
	            String oriFn = mf.getOriginalFilename();
	            if (oriFn == null || oriFn.isBlank()) {
	                return ResponseEntity.badRequest().body("파일명이 올바르지 않습니다.");
	            }
	            // 파일명
	            String saveName = oriFn;
	            // 새 이미지 저장
	            newFilePath = uploadDir.resolve(saveName);
	            mf.transferTo(newFilePath);
	            // DB에 저장할 이미지명 변경
	            vo.setImgn(saveName);

	        } else if (deleteImage) {
	            // 3. 이미지 삭제만 요청한 경우
	            vo.setImgn(null);
	        }
	        // 4. DB 수정
	        int result = noticeService.update(vo);
	        if (result == 0) {
	            // 수정 실패 시 새로 업로드한 파일 정리
	            if (newFilePath != null) {
	                Files.deleteIfExists(newFilePath);
	            }
	            return ResponseEntity.notFound().build();
	        }
	        // 5. 이미지가 변경되었거나 삭제된 경우
	        boolean imageChanged =
	                newFilePath != null || deleteImage;
	        // 기존 이미지가 있는 경우에만 삭제
	        if (imageChanged &&
	                oldImgn != null &&
	                !oldImgn.isBlank() &&
	                !oldImgn.equals(vo.getImgn())) {
	            Path oldFilePath = uploadDir.resolve(oldImgn);
	            try {
	                Files.deleteIfExists(oldFilePath);
	            } catch (IOException e) {
	                e.printStackTrace();
	            }
	        }
	        return ResponseEntity.ok(result);
	    } catch (Exception e) {

	        e.printStackTrace();
	        if (newFilePath != null) {
	            try {
	                Files.deleteIfExists(newFilePath);
	            } catch (IOException ex) {
	                ex.printStackTrace();
	            }
	        }
	        return ResponseEntity.internalServerError()
	                .body("공지사항 수정 실패");
	    }
	}
	
	
}
