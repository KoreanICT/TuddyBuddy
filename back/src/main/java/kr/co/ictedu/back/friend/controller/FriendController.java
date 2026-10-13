// 주용현

package kr.co.ictedu.back.friend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import kr.co.ictedu.back.friend.service.FriendService;
import kr.co.ictedu.back.friend.vo.FriendVO;

@Tag(name = "친구 API", description = "친구 요청, 받은 요청, 보낸 요청, 상세 조회, 수락, 거절, 목록, 삭제 API")
@RestController
@RequestMapping("/api/friend")
public class FriendController {

    @Autowired
    private FriendService friendService;

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
            @ModelAttribute FriendVO vo) {
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
        description = "회원 번호(response_num)를 이용해 받은 친구 요청 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "받은 친구 요청 목록 조회 성공")
    @GetMapping("/friendRequestList")
    public List<FriendVO> friendRequestList(
            @Parameter(description = "친구 요청을 받은 회원 번호", required = true, example = "1")
            @RequestParam("response_num") Long response_num) {
        System.out.println("받은 친구 요청 목록 조회 성공");
        return friendService.requestList(response_num);
    }

    // 보낸 친구 요청 목록
    @Operation(
        summary = "보낸 친구 요청 목록",
        description = "회원 번호(request_num)를 이용해 보낸 친구 요청 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "보낸 친구 요청 목록 조회 성공")
    @GetMapping("/friendResponseList")
    public List<FriendVO> friendResponseList(
            @Parameter(description = "친구 요청을 보낸 회원 번호", required = true, example = "1")
            @RequestParam("request_num") Long request_num) {
        System.out.println("보낸 친구 요청 목록 조회 성공");
        return friendService.responseList(request_num);
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
            @RequestParam("num") Long num) {
        System.out.println("친구 요청 상세 조회");
        return friendService.detail(num);
    }

    // 친구 요청 수락
    @Operation(
        summary = "친구 요청 수락",
        description = "친구 요청 번호와 요청을 받은 회원 번호를 이용해 친구 요청을 수락합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 요청 수락 성공")
    @ApiResponse(responseCode = "400", description = "친구 요청 수락 실패")
    @PutMapping("/friendAccept")
    public ResponseEntity<?> friendAccept(
            @Parameter(description = "친구 요청 번호", required = true, example = "1")
            @RequestParam("num") Long num,
            @Parameter(description = "친구 요청을 받은 회원 번호", required = true, example = "2")
            @RequestParam("response_num") Long response_num) {
        try {
            friendService.accept(num, response_num);
            return ResponseEntity.ok("친구 요청을 수락했습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 친구 요청 거절
    @Operation(
        summary = "친구 요청 거절",
        description = "친구 요청 번호와 요청을 받은 회원 번호를 이용해 친구 요청을 거절합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 요청 거절 성공")
    @ApiResponse(responseCode = "400", description = "친구 요청 거절 실패")
    @PutMapping("/friendReject")
    public ResponseEntity<?> friendReject(
            @Parameter(description = "친구 요청 번호", required = true, example = "1")
            @RequestParam("num") Long num,
            @Parameter(description = "친구 요청을 받은 회원 번호", required = true, example = "2")
            @RequestParam("response_num") Long response_num) {
        try {
            friendService.reject(num, response_num);
            return ResponseEntity.ok("친구 요청을 거절했습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 친구 목록
    @Operation(
        summary = "친구 목록 조회",
        description = "회원 번호(member_num)를 이용해 친구 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 목록 조회 성공")
    @GetMapping("/friendList")
    public List<FriendVO> friendList(
            @Parameter(description = "회원 번호", required = true, example = "1")
            @RequestParam("member_num") Long member_num) {
        System.out.println("내 친구 목록 조회");
        return friendService.friendList(member_num);
    }

    // 친구 삭제
    @Operation(
        summary = "친구 삭제",
        description = "친구 관계 번호(num)와 회원 번호(member_num)를 이용해 친구 관계를 삭제합니다."
    )
    @ApiResponse(responseCode = "200", description = "친구 삭제 성공")
    @ApiResponse(responseCode = "400", description = "친구 삭제 실패")
    @DeleteMapping("/friendDelete")
    public ResponseEntity<?> friendDelete(
            @Parameter(description = "친구 관계 번호", required = true, example = "1")
            @RequestParam("num") Long num,
            @Parameter(description = "회원 번호", required = true, example = "1")
            @RequestParam("member_num") Long member_num) {
        try {
            friendService.del(num, member_num);
            System.out.println("친구 삭제 성공");
            return ResponseEntity.ok().body("삭제 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
