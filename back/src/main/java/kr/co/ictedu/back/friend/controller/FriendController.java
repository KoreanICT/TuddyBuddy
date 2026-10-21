// 주용현

package kr.co.ictedu.back.friend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import kr.co.ictedu.back.friend.service.FriendService;
import kr.co.ictedu.back.friend.vo.FriendVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;

@Tag(name = "친구 API", description = "친구 요청, 받은 요청, 보낸 요청, 상세 조회, 수락, 거절, 목록, 삭제 API")
@RestController
@RequestMapping("/api/friend")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @Autowired
    private MemberService memberService;

    private Long getLoginMemberNum(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO member = memberService.getMemberByEmail(authentication.getName());
        if (member == null || member.getMember_num() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 회원 정보를 찾을 수 없습니다.");
        }
        return member.getMember_num();
    }

    // 친구 요청
    @Operation(
        summary = "친구 요청",
        description = "친구 요청 정보를 등록합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 요청 성공")
    @ApiResponse(responseCode = "400", description = "잘못된 친구 요청")
    @ApiResponse(responseCode = "409", description = "이미 친구 관계")
    @PostMapping("/friendAdd")
    public ResponseEntity<?> friendAdd(
            @Parameter(description = "친구 요청 정보")
            @ModelAttribute FriendVO vo, Authentication authentication) {
        vo.setRequest_num(getLoginMemberNum(authentication));
        try {
            friendService.add(vo);
            System.out.println("친구 요청 성공");
            return ResponseEntity.ok().body("친구 요청 성공!");
        } catch (IllegalArgumentException e) {
            System.out.println("친구 요청 실패: " + e.getMessage());

            if (e.getMessage().contains("이미 친구")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 받은 친구 요청 목록
    @Operation(
        summary = "받은 친구 요청 목록",
        description = "로그인한 회원이 받은 친구 요청 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "받은 친구 요청 목록 조회 성공")
    @GetMapping("/friendRequestList")
    public List<FriendVO> friendRequestList(
            @Parameter(description = "호환용 회원 번호 (조회에는 로그인 정보 사용)")
            @RequestParam(value = "response_num", required = false) Long response_num,
            Authentication authentication) {
        System.out.println("받은 친구 요청 목록 조회 성공");
        return friendService.requestList(getLoginMemberNum(authentication));
    }

    // 보낸 친구 요청 목록
    @Operation(
        summary = "보낸 친구 요청 목록",
        description = "로그인한 회원이 보낸 친구 요청 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "보낸 친구 요청 목록 조회 성공")
    @GetMapping("/friendResponseList")
    public List<FriendVO> friendResponseList(
            @Parameter(description = "호환용 회원 번호 (조회에는 로그인 정보 사용)")
            @RequestParam(value = "request_num", required = false) Long request_num,
            Authentication authentication) {
        System.out.println("보낸 친구 요청 목록 조회 성공");
        return friendService.responseList(getLoginMemberNum(authentication));
    }

    // 친구 요청 상세 조회
    @Operation(
        summary = "친구 요청 상세 조회",
        description = "친구 요청 번호(num)를 이용해 상세 정보를 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 요청 상세 조회 성공")
    @GetMapping("/friendDetail")
    public FriendVO friendDetail(
            @Parameter(description = "친구 요청 번호", required = true, example = "1")
            @RequestParam("num") Long num, Authentication authentication) {
        Long memberNum = getLoginMemberNum(authentication);
        FriendVO friend = friendService.detail(num);
        if (friend == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "친구 요청을 찾을 수 없습니다.");
        }
        if (!memberNum.equals(friend.getRequest_num()) && !memberNum.equals(friend.getResponse_num())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "친구 요청을 조회할 권한이 없습니다.");
        }
        System.out.println("친구 요청 상세 조회");
        return friend;
    }

    // 친구 요청 수락
    @Operation(
        summary = "친구 요청 수락",
        description = "로그인한 회원이 받은 친구 요청을 수락합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 요청 수락 성공")
    @ApiResponse(responseCode = "400", description = "친구 요청 수락 실패")
    @PutMapping("/friendAccept")
    public ResponseEntity<?> friendAccept(
            @Parameter(description = "친구 요청 번호", required = true, example = "1")
            @RequestParam("num") Long num,
            @Parameter(description = "호환용 회원 번호 (처리에는 로그인 정보 사용)")
            @RequestParam(value = "response_num", required = false) Long response_num,
            Authentication authentication) {
        Long memberNum = getLoginMemberNum(authentication);
        try {
            friendService.accept(num, memberNum);
            return ResponseEntity.ok("친구 요청을 수락했습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 친구 요청 거절
    @Operation(
        summary = "친구 요청 거절",
        description = "로그인한 회원이 받은 친구 요청을 거절합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 요청 거절 성공")
    @ApiResponse(responseCode = "400", description = "친구 요청 거절 실패")
    @PutMapping("/friendReject")
    public ResponseEntity<?> friendReject(
            @Parameter(description = "친구 요청 번호", required = true, example = "1")
            @RequestParam("num") Long num,
            @Parameter(description = "호환용 회원 번호 (처리에는 로그인 정보 사용)")
            @RequestParam(value = "response_num", required = false) Long response_num,
            Authentication authentication) {
        Long memberNum = getLoginMemberNum(authentication);
        try {
            friendService.reject(num, memberNum);
            return ResponseEntity.ok("친구 요청을 거절했습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 친구 목록
    @Operation(
        summary = "친구 목록 조회",
        description = "로그인한 회원의 친구 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 목록 조회 성공")
    @GetMapping("/friendList")
    public List<FriendVO> friendList(
            @Parameter(description = "호환용 회원 번호 (조회에는 로그인 정보 사용)")
            @RequestParam(value = "member_num", required = false) Long member_num,
            Authentication authentication) {
        System.out.println("내 친구 목록 조회");
        return friendService.friendList(getLoginMemberNum(authentication));
    }

    @Operation(summary = "보낸 친구 요청 취소", description = "로그인 회원이 보낸 대기 중 요청만 취소합니다.")
    @DeleteMapping("/friendCancel")
    public ResponseEntity<?> friendCancel(@RequestParam("num") Long num, Authentication authentication) {
        Long memberNum = getLoginMemberNum(authentication);
        try {
            friendService.cancel(num, memberNum);
            return ResponseEntity.ok("친구 요청을 취소했습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // 친구 삭제
    @Operation(
        summary = "친구 삭제",
        description = "로그인한 회원이 참여한 친구 관계를 삭제합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 삭제 성공")
    @ApiResponse(responseCode = "400", description = "친구 삭제 실패")
    @DeleteMapping("/friendDelete")
    public ResponseEntity<?> friendDelete(
            @Parameter(description = "친구 관계 번호", required = true, example = "1")
            @RequestParam("num") Long num,
            @Parameter(description = "호환용 회원 번호 (처리에는 로그인 정보 사용)")
            @RequestParam(value = "member_num", required = false) Long member_num,
            Authentication authentication) {
        Long memberNum = getLoginMemberNum(authentication);
        try {
            friendService.del(num, memberNum);
            System.out.println("친구 삭제 성공");
            return ResponseEntity.ok().body("삭제 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
