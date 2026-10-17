
package kr.co.ictedu.back.member.controller;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PutMapping;
import kr.co.ictedu.back.securityauth.MemberRoles;
import org.springframework.jdbc.core.JdbcTemplate;
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
	private JdbcTemplate jdbcTemplate;

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

		String trimmedNick = nick.trim();

		if (trimmedNick.isEmpty()) {
			return ResponseEntity.badRequest().build();
		}

        String sql =
            "SELECT COUNT(*) FROM member WHERE member_nick = ?";

        Integer count = jdbcTemplate.queryForObject(
            sql,
            Integer.class,
            trimmedNick
        );

        System.out.println(
            "닉네임 중복 확인 : " + trimmedNick
            + " / 중복 개수 : " + count
        );

        return ResponseEntity.ok(
            count == null ? 0 : count
        );
    }

    // ==========================================
    // 마이페이지 회원정보 조회 (JWT)
    // ==========================================
    @GetMapping({"/me", "/mypage"})
    public ResponseEntity<?> getMyInfo(
            Authentication authentication) {

        // JWT 인증 여부 확인
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                    authentication.getPrincipal()
                )) {

            return ResponseEntity.status(401).body(
                Map.of(
                    "success", false,
                    "message", "로그인이 필요합니다."
                )
            );
        }

        // JWT에서 인증된 이메일 가져오기
        String email = authentication.getName();

        if (email == null || email.isBlank()) {

            return ResponseEntity.status(401).body(
                Map.of(
                    "success", false,
                    "message", "회원 인증정보가 없습니다."
                )
            );
        }

        // Oracle DB에서 실제 회원 조회
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

        // 화면에 필요한 회원정보만 반환
        // 비밀번호, 소셜 ID는 제외
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
            member.getRegdate()
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
    // 회원정보 수정 (기존 기능 유지)
    // ==========================================
    @PostMapping("/update")
    public int updateMyInfo(
            @RequestBody MemberVO vo) {

        System.out.println(
            "받은 nick = " + vo.getMember_nick()
        );

        System.out.println(
            "받은 email = " + vo.getMember_email()
        );

		return memberService.updateMember(vo);
	}

    // ==========================================
    // 회원 탈퇴 (기존 기능 유지)
    // ==========================================
    @DeleteMapping("/withdraw")
    public String memberWithdraw(
            @RequestParam(value = "num", required = false) Long ignoredNum,
            Authentication authentication,
            HttpServletRequest request) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO member = memberService.getMemberByEmail(authentication.getName());
        if (member == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "회원 인증정보가 없습니다.");
        }
        memberService.withdrawMember(member.getMember_num());
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
            item.put("member_email", member.getMember_email());
            item.put("member_name", member.getMember_name());
            item.put("member_nick", member.getMember_nick());
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

	// 회원 코드로 회원 검색
	// 담당인원 : 주용현
	@GetMapping("/memberCodeSearch")
	public ResponseEntity<?> memberCodeSearch(@RequestParam("member_code") String member_code) {

		try {

			MemberVO vo = memberService.findByMemberCode(member_code);

			if (vo == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(vo);

		} catch (IllegalArgumentException e) {

			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// 회원 번호로 회원 정보 상세 조회
	// 담당인원 : 주용현
	@GetMapping("/memberProfile")
	public ResponseEntity<?> getMemberProfile(@RequestParam("member_num") Long member_num) {
		try {
			Map<String, Object> profile = memberService.getMemberProfile(member_num);

			if (profile == null || profile.isEmpty()) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(profile);

		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
    public record AuthorityUpdateRequest(Long memberNum, String authority) { }

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
