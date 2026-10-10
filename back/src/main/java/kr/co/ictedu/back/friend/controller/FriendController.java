package kr.co.ictedu.back.friend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.friend.service.FriendService;
import kr.co.ictedu.back.friend.vo.FriendVO;

import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/friend")
public class FriendController {

	@Autowired
	private FriendService friendService;

	// 친구 요청
    @PostMapping("/friendAdd")
    public ResponseEntity<?> friendAdd(@ModelAttribute FriendVO vo) {
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
	@GetMapping("/friendRequestList")
	public List<FriendVO> friendRequestList(@RequestParam("response_num") Long response_num) {
		System.out.println("받은 친구 요청 목록 조회 성공");
		return friendService.requestList(response_num);
	}

	// 보낸 친구 요청 목록
	@GetMapping("/friendResponseList")
	public List<FriendVO> friendResponseList(@RequestParam("request_num") Long request_num) {
		System.out.println("보낸 친구 요청 목록 조회 성공");
		return friendService.responseList(request_num);
	}

	// 친구 요청 상세 조회
	@GetMapping("/friendDetail")
	public FriendVO friendDetail(@RequestParam("num") Long num) {
		System.out.println("친구 요청 상세 조회");
		return friendService.detail(num);
	}


    // 친구 요청 수락
    @PutMapping("/friendAccept")
    public ResponseEntity<?> friendAccept(@RequestParam("num") Long num) {
        try {
            friendService.accept(num);
            System.out.println("친구 요청 수락 성공");
            return ResponseEntity.ok().body("요청 수락");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 친구 요청 거절
    @PutMapping("/friendReject")
    public ResponseEntity<?> friendReject(@RequestParam("num") Long num) {
        try {
            friendService.reject(num);
            System.out.println("친구 요청 거절 성공");
            return ResponseEntity.ok().body("요청 거절");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
	// 친구 목록
	@GetMapping("/friendList")
	public List<FriendVO> friendList(@RequestParam("member_num") Long member_num) {
		System.out.println("내 친구 목록 조회");
		return friendService.friendList(member_num);
	}

	// 친구 삭제
	@DeleteMapping("/friendDelete")
	public ResponseEntity<?> friendDelete(@RequestParam("num") Long num, @RequestParam("member_num") Long member_num) {
	    try {
	        friendService.del(num, member_num);
	        System.out.println("친구 삭제 성공");
	        return ResponseEntity.ok().body("삭제 성공");
	    } catch (IllegalArgumentException e) {
	        return ResponseEntity.badRequest().body(e.getMessage());
	    }
	}
}