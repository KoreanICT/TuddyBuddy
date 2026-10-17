
package kr.co.ictedu.back.member.controller;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PutMapping;
import kr.co.ictedu.back.securityauth.MemberRoles;
import kr.co.ictedu.back.securityauth.AuthCookies;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.service.MemberService.PasswordChangeResult;
import kr.co.ictedu.back.member.vo.MemberVO;

@CrossOrigin(
    origins = "http://localhost:3000",
    allowCredentials = "true"
)
@RestController
@RequestMapping("/api/member")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @Autowired
    private PagingService pagingService;

    @Autowired
    private AuthCookies authCookies;

    // ==========================================
    // 관리자 회원가입
    // ==========================================
    @PostMapping("/admin/signup")
    public ResponseEntity<?> adminSignup(
            @RequestBody MemberVO vo) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("최고 관리자 계정은 DB 관리자가 관리합니다.");
	}

    // ==========================================
    // 일반 회원가입
    // ==========================================
    @PostMapping("/signup")
    public ResponseEntity<?> memberjoin(
            @RequestBody MemberVO memberDTO) {

        System.out.println("회원가입 요청 들어옴");

        System.out.println(
            "email = " + memberDTO.getMember_email()
        );

        System.out.println(
            "nick = " + memberDTO.getMember_nick()
        );

		memberDTO.setAuthority(MemberRoles.MEMBER);

        memberService.create(memberDTO);

        return ResponseEntity.ok(
            "회원가입이 완료되었습니다."
        );
    }

    // ==========================================
    // 이메일 중복 확인
    // ==========================================
    @GetMapping("/emailCheck")
    public int emailCheck(
            @RequestParam("email") String email) {

        System.out.println(
            "이메일 중복 확인 : " + email
        );

        return memberService.checkemail(email);
    }

    // ==========================================
    // 닉네임 중복 확인
    // ==========================================
    @GetMapping("/nickCheck")
    public ResponseEntity<Integer> nickCheck(
            @RequestParam("nick") String nick) {

        if (nick == null || nick.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String trimmedNick = nick.trim();

        return ResponseEntity.ok(memberService.checkNick(trimmedNick));
    }

    // ==========================================
    // 마이페이지 회원정보 조회 (JWT)
    // ==========================================
    @GetMapping({"/me", "/mypage"})
    public ResponseEntity<?> getMyInfo(
            Authentication authentication) {

        if (!isLoggedIn(authentication)) {
            return ResponseEntity.status(401).body(
                Map.of(
                    "success", false,
                    "message", "로그인이 필요합니다."
                )
            );
        }

        String email = authentication.getName();

        MemberVO member =
            memberService.getMemberByEmail(email);

        if (member == null) {
            return ResponseEntity.status(404).body(
                Map.of(
                    "success", false,
                    "message", "회원정보를 찾을 수 없습니다."
                )
            );
        }

        // 비밀번호와 카카오 고유 ID는 반환하지 않음
        Map<String, Object> response =
            new LinkedHashMap<>();

        response.put(
            "member_num",
            member.getMember_num()
        );

        response.put(
            "member_email",
            member.getMember_email()
        );

        response.put(
            "member_name",
            member.getMember_name()
        );

        response.put(
            "member_nick",
            member.getMember_nick()
        );

        response.put(
            "member_phone",
            member.getMember_phone()
        );

        response.put(
            "authority",
            member.getAuthority()
        );

        response.put(
            "regdate",
            member.getRegdate() == null ? null : member.getRegdate().toLocalDate().toString()
        );

        response.put(
            "member_code",
            member.getMember_code()
        );

        response.put(
            "point",
            member.getPoint()
        );

        response.put(
            "member_login_type",
            member.getMember_login_type()
        );

        System.out.println(
            "===== 마이페이지 회원정보 조회 성공 ====="
        );

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 회원정보 수정 (JWT)
    // 닉네임, 전화번호 변경
    // ==========================================
    @PostMapping("/update")
    public ResponseEntity<?> updateMyInfo(
            @RequestBody MemberVO vo,
            Authentication authentication) {

        if (!isLoggedIn(authentication)) {
            return ResponseEntity.status(401).body(
                Map.of(
                    "success", false,
                    "message", "로그인이 필요합니다."
                )
            );
        }

        String loginEmail = authentication.getName();

        MemberVO loginMember =
            memberService.getMemberByEmail(loginEmail);

        if (loginMember == null) {
            return ResponseEntity.status(404).body(
                Map.of(
                    "success", false,
                    "message", "회원정보를 찾을 수 없습니다."
                )
            );
        }

        if (vo == null
                || vo.getMember_nick() == null
                || vo.getMember_phone() == null) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "닉네임과 전화번호를 입력해주세요."
                )
            );
        }

        String nickname = vo.getMember_nick().trim();
        String phone = vo.getMember_phone().trim();

        // 닉네임 길이 검사
        if (nickname.length() < 2
                || nickname.length() > 12) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "닉네임은 2~12자로 입력해주세요."
                )
            );
        }

        // 닉네임 형식 검사
        if (!nickname.matches("^[가-힣a-zA-Z0-9]+$")) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "닉네임은 한글, 영문, 숫자만 사용할 수 있습니다."
                )
            );
        }

        if (nickname.matches("^[0-9]+$")) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "숫자로만 이루어진 닉네임은 사용할 수 없습니다."
                )
            );
        }

        String lowerNickname = nickname.toLowerCase();

        if (List.of(
                "관리자",
                "운영자",
                "admin",
                "administrator"
            ).contains(lowerNickname)) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "사용할 수 없는 닉네임입니다."
                )
            );
        }

        // 전화번호 검사
        String phoneNumber = phone.replace("-", "");

        if (!phoneNumber.matches("^01[0-9]{8,9}$")) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "올바른 휴대전화 번호를 입력해주세요."
                )
            );
        }

        // 현재 회원을 제외한 닉네임 중복 확인
        int duplicateCount = memberService.countByNickExcludingMember(
            nickname, loginMember.getMember_num()
        );

        if (duplicateCount > 0) {

            return ResponseEntity.status(409).body(
                Map.of(
                    "success", false,
                    "message", "이미 사용 중인 닉네임입니다."
                )
            );
        }

        // 클라이언트가 보낸 회원번호나 이메일은 사용하지 않음
        MemberVO updateMember = new MemberVO();

        updateMember.setMember_email(
            loginMember.getMember_email()
        );

        updateMember.setMember_nick(nickname);
        updateMember.setMember_phone(phoneNumber);

        try {
            int result =
                memberService.updateMember(updateMember);

            if (result <= 0) {
                return ResponseEntity.status(500).body(
                    Map.of(
                        "success", false,
                        "message", "회원정보 수정에 실패했습니다."
                    )
                );
            }

            System.out.println(
                "===== 회원정보 수정 성공 ====="
            );

            return ResponseEntity.ok(result);

        } catch (DataIntegrityViolationException e) {

            return ResponseEntity.status(409).body(
                Map.of(
                    "success", false,
                    "message", "이미 사용 중인 정보가 있습니다."
                )
            );
        }
    }

    // ==========================================
    // 일반 회원 비밀번호 변경 (JWT)
    // ==========================================
    @PostMapping("/password/change")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication,
            HttpServletRequest servletRequest, HttpServletResponse servletResponse) {

    	 System.out.println("===== 비밀번호 변경 Controller 진입 =====");

    	    System.out.println(
    	        "인증 사용자: " +
    	        (authentication != null
    	            ? authentication.getName()
    	            : "null")
    	    );
        // 로그인 확인
        if (!isLoggedIn(authentication)) {
            return ResponseEntity.status(401).body(
                Map.of(
                    "success", false,
                    "message", "로그인이 필요합니다."
                )
            );
        }

        if (request == null) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "비밀번호 정보를 입력해주세요."
                )
            );
        }

        String currentPassword =
            request.get("currentPassword");

        String newPassword =
            request.get("newPassword");

        String newPasswordCheck =
            request.get("newPasswordCheck");

        // 필수값 확인
        if (currentPassword == null
                || currentPassword.isEmpty()
                || newPassword == null
                || newPassword.isEmpty()
                || newPasswordCheck == null
                || newPasswordCheck.isEmpty()) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "비밀번호 항목을 모두 입력해주세요."
                )
            );
        }

        // 비밀번호 확인 일치 여부
        if (!newPassword.equals(newPasswordCheck)) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "새 비밀번호가 일치하지 않습니다."
                )
            );
        }

        // JWT 사용자 이메일로만 비밀번호 변경
        String email = authentication.getName();

        PasswordChangeResult result =
            memberService.changePassword(
                email,
                currentPassword,
                newPassword
            );

        switch (result) {

            case SUCCESS:
                authCookies.clear(servletRequest, servletResponse);
                System.out.println(
                    "===== 일반 회원 비밀번호 변경 성공 ====="
                );

                return ResponseEntity.ok(
                    Map.of(
                        "success", true,
                        "message", "비밀번호가 변경되었습니다."
                    )
                );

            case KAKAO_ACCOUNT:
                return ResponseEntity.status(403).body(
                    Map.of(
                        "success", false,
                        "message", "카카오 회원은 비밀번호를 변경할 수 없습니다."
                    )
                );

            case INVALID_CURRENT_PASSWORD:
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "success", false,
                        "message", "현재 비밀번호가 일치하지 않습니다."
                    )
                );

            case SAME_PASSWORD:
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "success", false,
                        "message", "현재 비밀번호와 다른 비밀번호를 입력해주세요."
                    )
                );

            case INVALID_NEW_PASSWORD:
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "success", false,
                        "message", "새 비밀번호는 8~72자이며 영문과 숫자를 포함해야 합니다."
                    )
                );

            case NOT_FOUND:
                return ResponseEntity.status(404).body(
                    Map.of(
                        "success", false,
                        "message", "회원정보를 찾을 수 없습니다."
                    )
                );

            default:
                return ResponseEntity.status(409).body(
                    Map.of(
                        "success", false,
                        "message", "비밀번호 변경 상태가 변경되었습니다. 다시 시도해주세요."
                    )
                );
        }
    }

    // ==========================================
    // JWT 로그인 여부 확인
    // ==========================================
    private boolean isLoggedIn(
            Authentication authentication) {

        return authentication != null
            && authentication.isAuthenticated()
            && authentication.getName() != null
            && !authentication.getName().isBlank()
            && !"anonymousUser".equals(
                authentication.getPrincipal()
            );
    }

    // ==========================================
    // 회원 탈퇴 (기존 기능 유지)
    // ==========================================
    @DeleteMapping("/withdraw")
    public String memberWithdraw(
            @RequestParam(value = "num", required = false) Long ignoredNum,
            Authentication authentication,
            HttpServletRequest request, HttpServletResponse response) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO member = memberService.getMemberByEmail(authentication.getName());
        if (member == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "회원 인증정보가 없습니다.");
        }
        memberService.withdrawMember(member.getMember_num());
        authCookies.clear(request, response);
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return "탈퇴 완료";
    }

    // ==========================================
    // 회원 전체 조회
    // ==========================================
    @RequestMapping("/memberList")
    public Map<String, Object> memberList(
            @RequestParam Map<String, String> paramMap,
            HttpServletRequest request, Authentication authentication) {

        requireManager(authentication);
		String cPage = paramMap.get("cPage");

        int totalCnt =
            memberService.totalCount(paramMap);

        PageVO pageVO =
            pagingService.makePage(totalCnt, cPage);

        // 마지막 페이지의 회원을 삭제한 후에도 유효한 페이지를 반환합니다.
        if (pageVO.getNowPage() > Math.max(1, pageVO.getTotalPage())) {
            pageVO = pagingService.makePage(totalCnt, String.valueOf(Math.max(1, pageVO.getTotalPage())));
        }

        Map<String, String> map =
            new HashMap<>(paramMap);

        map.put(
            "begin",
            String.valueOf(pageVO.getBeginPerPage())
        );

        map.put(
            "end",
            String.valueOf(pageVO.getEndPerPage())
        );

        List<MemberVO> list =
            memberService.list(map);

        Map<String, Object> response =
            new HashMap<>();

		response.put("data", list.stream().map(member -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("member_num", member.getMember_num());
            item.put("member_nick", member.getMember_nick());
            item.put("member_code", member.getMember_code());
            item.put("authority", member.getAuthority());
            item.put("regdate", member.getRegdate());
            return item;
        }).toList());
		response.put("totalItems", pageVO.getTotalRecord());
		response.put("totalPages", pageVO.getTotalPage());
		response.put("currentPage", pageVO.getNowPage());
		response.put("startPage", pageVO.getStartPage());
		response.put("endPage", pageVO.getEndPage());

        return response;
    }

    // ==========================================
    // 회원 코드로 회원 검색
    // 담당인원 : 주용현
    // ==========================================
    @GetMapping("/memberCodeSearch")
    public ResponseEntity<?> memberCodeSearch(
            @RequestParam("member_code") String member_code) {

        try {
            MemberVO vo =
                memberService.findByMemberCode(
                    member_code
                );

            if (vo == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(vo);

        }  catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
    @GetMapping("/memberProfile")
    public ResponseEntity<?> memberProfile(@RequestParam("member_num") Long memberNum,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        if (memberNum <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원 번호가 올바르지 않습니다.");
        }
        Map<String, Object> profile = memberService.getMemberProfile(memberNum);
        if (profile == null || profile.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(profile);
    }

    public record AuthorityUpdateRequest(Long memberNum, String authority) { }

    @DeleteMapping("/admin/withdraw")
    public ResponseEntity<?> withdrawManagedMember(@RequestParam("memberNum") Long memberNum) {
        try {
            memberService.withdrawManagedMember(memberNum);
            return ResponseEntity.ok(Map.of("success", true, "message", "회원 탈퇴 처리가 완료되었습니다."));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false,
                    "message", e.getReason() == null ? "회원 탈퇴 처리에 실패했습니다." : e.getReason()));
        }
    }

    @PutMapping("/admin/authority")
    public ResponseEntity<?> updateAuthority(@RequestBody AuthorityUpdateRequest body) {
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원 번호와 권한이 필요합니다.");
        }
        memberService.updateManagedAuthority(body.memberNum(), body.authority());
        return ResponseEntity.ok(Map.of("success", true, "message", "회원 권한을 변경했습니다."));
    }

    private void requireManager(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO member = memberService.getMemberByEmail(authentication.getName());
        if (member == null || !MemberRoles.isManager(member.getAuthority())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
        }
    }

}
