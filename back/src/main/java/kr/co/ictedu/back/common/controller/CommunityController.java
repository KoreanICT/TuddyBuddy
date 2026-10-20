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

	
	// 1. 게시글 쓰기
	@PostMapping("/write")
	public ResponseEntity<Map<String, Object>> writePost(@RequestBody PostWriteRequest request,
            Authentication authentication) {
        MemberVO member = loginMember(authentication);
        try {
            MyPostVO post = communityService.savePost(request, member);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success",
                    "message", "게시글이 성공적으로 작성되었습니다.", "post", post));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "게시글 저장 형식 또는 길이가 데이터베이스 제한에 맞지 않습니다.");
        }
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
