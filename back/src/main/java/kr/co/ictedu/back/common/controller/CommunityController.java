package kr.co.ictedu.back.common.controller;

import kr.co.ictedu.back.common.vo.CommunityVO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

	
	// 1. 게시글 쓰기
	@PostMapping("/write")
	public ResponseEntity<Map<String, Object>> writePost(@RequestBody CommunityVO communityVO) {
		// TODO: 서비스 계층을 호출하여 게시글 저장 로직 구현
		System.out.println("게시글 제목: " + communityVO.getTitle());
		System.out.println("게시글 내용: " + communityVO.getContent());

		Map<String, Object> response = new HashMap<>();
		response.put("status", "success");
		response.put("message", "게시글이 성공적으로 작성되었습니다.");

		return ResponseEntity.ok(response);
	}

	// 2. 게시글 삭제하기
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<Map<String, Object>> deletePost(@PathVariable("id") int id) {
		// TODO: 서비스 계층을 호출하여 ID에 해당하는 게시글 삭제 로직 구현
		System.out.println("삭제할 게시글 번호: " + id);

		Map<String, Object> response = new HashMap<>();
		response.put("status", "success");
		response.put("message", "게시글이 삭제되었습니다.");

		return ResponseEntity.ok(response);
	}

	// 3. 댓글 쓰기
	@PostMapping("/comment/write")
	public ResponseEntity<Map<String, Object>> writeComment(@RequestParam("postId") int postId,
			@RequestBody CommunityVO commentVO) { // 댓글용 VO를 분리하거나 CommunityVO를 활용할 수 있습니다.
		// TODO: 댓글 저장 서비스 로직 구현
		System.out.println("대상 게시글 번호: " + postId);
		System.out.println("댓글 내용: " + commentVO.getContent());

		Map<String, Object> response = new HashMap<>();
		response.put("status", "success");
		response.put("message", "댓글이 작성되었습니다.");

		return ResponseEntity.ok(response);
	}

	// 4. 댓글 삭제
	@DeleteMapping("/comment/delete/{commentId}")
	public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable("commentId") int commentId) {
		// TODO: 댓글 삭제 서비스 로직 구현
		System.out.println("삭제할 댓글 번호: " + commentId);

		Map<String, Object> response = new HashMap<>();
		response.put("status", "success");
		response.put("message", "댓글이 삭제되었습니다.");

		return ResponseEntity.ok(response);
	}

	// 5. 임시글 작성 (임시 저장)
	@PostMapping("/temp-save")
	public ResponseEntity<Map<String, Object>> tempSavePost(@RequestBody CommunityVO communityVO) {
		// TODO: 임시저장 상태로 데이터베이스에 저장하는 로직 구현
		System.out.println("임시저장할 제목: " + communityVO.getTitle());

		Map<String, Object> response = new HashMap<>();
		response.put("status", "success");
		response.put("message", "임시글이 저장되었습니다.");

		return ResponseEntity.ok(response);
	}
}