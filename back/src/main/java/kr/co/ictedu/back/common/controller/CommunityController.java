package kr.co.ictedu.back.common.controller;

import kr.co.ictedu.back.common.vo.CommunityVO;
import kr.co.ictedu.back.common.vo.PostWriteRequest;
import kr.co.ictedu.back.common.vo.MyPostVO;
import org.springframework.dao.DataIntegrityViolationException;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.common.service.CommunityService;
import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

	private final CommunityService communityService;
	private final MemberService memberService;
	private final PagingService pagingService;

	public CommunityController(CommunityService communityService, MemberService memberService,
			PagingService pagingService) {

		this.communityService = communityService;
		this.memberService = memberService;
		this.pagingService = pagingService;
	}

	// =========================================================
	// 1. 내 게시글 목록
	// GET /api/community/my-posts?cPage=1
	// =========================================================
	@GetMapping("/my-posts")
	public Map<String, Object> myPosts(@RequestParam(value = "cPage", defaultValue = "1") int cPage,
			Authentication authentication) {

		MemberVO member = loginMember(authentication);

		if (cPage < 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "페이지 번호는 1 이상이어야 합니다.");
		}

		Long memberNum = member.getMember_num();

		int totalItems = communityService.countMyPosts(memberNum);

		PageVO page = page(totalItems, cPage);

		Map<String, Object> response = pagination(totalItems, page);

		response.put("data", communityService.findMyPosts(memberNum, page.getBeginPerPage(), page.getEndPerPage()));

		return response;
	}

	// =========================================================
	// 2. 게시글 목록
	// GET /api/community/posts?cPage=1
	// =========================================================
	@GetMapping("/posts")
	public Map<String, Object> posts(@RequestParam(value = "cPage", defaultValue = "1") int cPage,
			Authentication authentication) {

		loginMember(authentication);

		if (cPage < 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "페이지 번호는 1 이상이어야 합니다.");
		}

		int totalItems = communityService.countPosts();

		PageVO page = page(totalItems, cPage);

		Map<String, Object> response = pagination(totalItems, page);

		response.put("data", communityService.findPosts(page.getBeginPerPage(), page.getEndPerPage()));

		return response;
	}

	// =========================================================
	// 로그인 회원 확인
	// =========================================================
	private MemberVO loginMember(Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {

			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}

		MemberVO member = memberService.getMemberByEmail(authentication.getName());

		if (member == null || member.getMember_num() == null) {

			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 회원 정보를 찾을 수 없습니다.");
		}

		return member;
	}

	// =========================================================
	// 페이징
	// =========================================================
	private PageVO page(int totalItems, int cPage) {

		int lastPage = (int) Math.ceil(totalItems / 10.0);

		int currentPage = Math.min(cPage, Math.max(1, lastPage));

		return pagingService.makePage(totalItems, String.valueOf(currentPage));
	}

	private Map<String, Object> pagination(int totalItems, PageVO page) {

		Map<String, Object> response = new HashMap<>();

		response.put("totalItems", totalItems);
		response.put("totalPages", page.getTotalPage());
		response.put("currentPage", page.getNowPage());
		response.put("startPage", page.getStartPage());
		response.put("endPage", page.getEndPage());

		return response;
	}

	// =========================================================
	// 3. 게시글 작성
	// POST /api/community/write
	// =========================================================
	@PostMapping("/write")
	public ResponseEntity<Map<String, Object>> writePost(@RequestBody PostWriteRequest request,
			Authentication authentication) {

		MemberVO member = loginMember(authentication);

		try {

			MyPostVO post = communityService.savePost(request, member);

			return ResponseEntity.status(HttpStatus.CREATED)
					.body(Map.of("status", "success", "message", "게시글이 성공적으로 작성되었습니다.", "post", post));

		} catch (DataIntegrityViolationException e) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "게시글 저장 형식 또는 길이가 데이터베이스 제한에 맞지 않습니다.");
		}
	}

	// =========================================================
	// 4. 게시글 삭제
	// DELETE /api/community/delete/{id}
	// =========================================================
	@DeleteMapping("/delete/{postNum}")
	public ResponseEntity<?> deletePost(@PathVariable("postNum") int postNum) {

	    try {
	        System.out.println("삭제 요청 게시글 번호 = " + postNum);

	        communityService.deletePost(postNum);

	        System.out.println("게시글 삭제 완료");

	        return ResponseEntity.ok("게시글 삭제 성공");

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("게시글 삭제 실패");
	    }
	}
	
	// =========================================================
	// 5. 게시글 수정
	// DELETE /api/community/update/{id}
	// =========================================================
	@PutMapping("/update/{postNum}")
	public ResponseEntity<?> updatePost(
	        @PathVariable("postNum") int postNum,
	        @RequestBody CommunityVO vo) {

	    try {
	        vo.setId(postNum);

	        communityService.updatePost(vo);

	        return ResponseEntity.ok("게시글 수정 성공");

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("게시글 수정 실패");
	    }
	}
	
	// =========================================================
	// ⚠️ 댓글 관련 API는 여기에서 작성하지 않습니다.
	//
	// /api/community/comment/write
	// /api/community/comment/list
	// /api/community/comment/delete
	//
	// 모두 CommentController에서 처리합니다.
	// =========================================================

	// =========================================================
	// 6. 임시글 작성
	// POST /api/community/temp-save
	// =========================================================
	@PostMapping("/temp-save")
	public ResponseEntity<Map<String, Object>> tempSavePost(@RequestBody CommunityVO communityVO) {

		System.out.println("임시저장할 제목: " + communityVO.getTitle());

		Map<String, Object> response = new HashMap<>();

		response.put("status", "success");
		response.put("message", "임시글이 저장되었습니다.");

		return ResponseEntity.ok(response);
	}

	// =========================================================
	// 7. 좋아요 누르기
	// POST /api/community/like
	// =========================================================
	@PostMapping("/like")
	public ResponseEntity<?> like(@RequestBody CommunityVO vo) {
	    try {

	        System.out.println("좋아요 게시글 번호 = " + vo.getId());

	        int result = communityService.like(vo);

	        System.out.println("좋아요 UPDATE 결과 = " + result);

	        if (result > 0) {
	            return ResponseEntity.ok("좋아요 성공");
	        } else {
	            return ResponseEntity.status(500).body("좋아요 실패");
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("좋아요 처리 중 오류");
	    }
	}
}