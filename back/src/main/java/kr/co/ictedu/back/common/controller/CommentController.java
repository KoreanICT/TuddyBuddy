package kr.co.ictedu.back.common.controller;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.common.dao.CommentDao;
import kr.co.ictedu.back.common.service.CommentService;
import kr.co.ictedu.back.common.service.CommunityService;
import kr.co.ictedu.back.common.vo.CommunityVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;

@RestController
@RequestMapping("/api/community/comment")
public class CommentController {

    private final CommentService commentService;
    private final MemberService memberService;

    public CommentController(
            CommentService commentService,
            MemberService memberService) {

        this.commentService = commentService;
        this.memberService = memberService;
    }


    // =========================================================
    // 1. 댓글 목록
    //
    // GET
    // /api/community/comment/list?postId=1
    // =========================================================
    @GetMapping("/list")
    public ResponseEntity<List<CommentDao>> getComments(
            @RequestParam("postId") int postId) {

        List<CommentDao> comments =
                commentService.getComments(postId);

        return ResponseEntity.ok(comments);
    }


    // =========================================================
    // 2. 댓글 작성
    //
    // POST
    // /api/community/comment/write?postId=1
    //
    // React에서 보내는 데이터
    //
    // {
    //     "content": "안녕하세요"
    // }
    // =========================================================
    @PostMapping("/write")
    public ResponseEntity<?> createComment(
            @RequestParam("postId") int postId,
            @RequestBody CommentDao comment,
            Authentication authentication) {

        try {

            // -------------------------------------------------
            // 로그인 여부 확인
            // -------------------------------------------------
            if (authentication == null
                    || !authentication.isAuthenticated()
                    || authentication instanceof AnonymousAuthenticationToken) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }


            // -------------------------------------------------
            // 현재 로그인한 회원 조회
            // -------------------------------------------------
            MemberVO member =
                    memberService.getMemberByEmail(
                            authentication.getName()
                    );


            if (member == null
                    || member.getMember_num() == null) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("로그인 회원 정보를 찾을 수 없습니다.");
            }


            // -------------------------------------------------
            // 게시글 번호 설정
            // -------------------------------------------------
            comment.setPostId(postId);


            // -------------------------------------------------
            // 로그인한 회원 번호 설정
            //
            // 기존:
            // comment.setMemberNum(1);
            //
            // ↓
            // 실제 로그인 회원 번호 사용
            // -------------------------------------------------
            comment.setMemberNum(
                    member.getMember_num().intValue()
            );


            // -------------------------------------------------
            // 댓글 내용 확인
            // -------------------------------------------------
            if (comment.getContent() == null
                    || comment.getContent().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("댓글 내용을 입력해주세요.");
            }


            // -------------------------------------------------
            // 댓글 저장
            // -------------------------------------------------
            commentService.createComment(comment);


            // -------------------------------------------------
            // 성공
            // -------------------------------------------------
            return ResponseEntity.ok().build();


        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("댓글 등록 중 오류가 발생했습니다.");
        }
    }


    // =========================================================
    // 3. 댓글 삭제
    //
    // DELETE
    // /api/community/comment/delete?commentNum=1
    // =========================================================
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteComment(
            @RequestParam("commentNum") int commentNum) {

        try {

            commentService.deleteComment(commentNum);

            return ResponseEntity.ok().build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("댓글 삭제 중 오류가 발생했습니다.");
        }
    }
    
    
    // =========================================================
    // 4. 댓글 수정
    //
    // UPDATE
    // /api/community/comment/update?commentNum=1
    // =========================================================
    @PutMapping("/update")
    public ResponseEntity<?> updateComment(@RequestBody CommunityVO vo) {
        try {
            int result = commentService.updateComment(vo);

            if (result > 0) {
                return ResponseEntity.ok("댓글 수정 성공");
            }

            return ResponseEntity.badRequest().body("댓글 수정 실패");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("댓글 수정 중 오류가 발생했습니다.");
        }
    }
    
    
}