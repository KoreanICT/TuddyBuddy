package kr.co.ictedu.back.member.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import kr.co.ictedu.back.common.service.PagingService;
import kr.co.ictedu.back.common.vo.PageVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/member")
public class MemberController {

    @Autowired
    private MemberService memberService;


    // =========================================================
    // 관리자 회원가입
    // =========================================================
    @PostMapping("/admin/signup")
    public ResponseEntity<?> adminSignup(@RequestBody MemberVO vo) {

        // 관리자 권한으로 설정
        vo.setAuthority("ADMIN");

        memberService.create(vo);

        return ResponseEntity.ok("관리자 생성 완료");
    }


    // =========================================================
    // 일반 회원가입
    // =========================================================
    @PostMapping("/signup")
    public ResponseEntity<?> memberjoin(@RequestBody MemberVO memberDTO) {

        System.out.println("회원가입 요청 들어옴");

        // 일반 회원 권한
        memberDTO.setAuthority("MEMBER");

        // 회원 고유 코드 생성
        memberDTO.setMember_code(UUID.randomUUID().toString());

        memberService.create(memberDTO);

        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }


    // =========================================================
    // 이메일 중복 확인
    // =========================================================
    @GetMapping("/emailCheck")
    public int emailCheck(
            @RequestParam("email") String email) {

        System.out.println("이메일 중복 확인 : " + email);

        return memberService.checkemail(email);
    }


    // =========================================================
    // 마이페이지
    // =========================================================
    @GetMapping("/mypage")
    public MemberVO getMyInfo(HttpSession session) {

        // 세션에서 로그인한 회원 정보 가져오기
        MemberVO loginMember =
                (MemberVO) session.getAttribute("loginMember");

        // 로그인하지 않은 경우
        if (loginMember == null) {
            return null;
        }

        // 로그인한 회원의 이메일로 회원 정보 조회
        MemberVO vo =
                memberService.getMemberByEmail(
                        loginMember.getMember_email()
                );

        // 비밀번호는 프론트로 보내지 않음
        if (vo != null) {
            vo.setMember_pwd(null);
        }

        return vo;
    }


    // =========================================================
    // 회원정보 수정
    // =========================================================
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


    // =========================================================
    // 회원 탈퇴
    // =========================================================
    @DeleteMapping("/withdraw")
    public String memberWithdraw(
            @RequestParam("num") Long num,
            HttpSession session) {

        System.out.println(
                "탈퇴 요청 num = " + num
        );

       memberService.withdrawMember(num);

        // 로그인 세션 삭제
        session.invalidate();

        return "탈퇴 완료";
    }


    // =========================================================
    // 페이징 서비스
    // =========================================================
    @Autowired
    private PagingService pagingService;


    // =========================================================
    // 회원 전체 조회
    // =========================================================
    @RequestMapping("/memberList")
    public Map<String, Object> memberList(
            @RequestParam Map<String, String> paramMap,
            HttpServletRequest request) {

        // 현재 페이지
        String cPage = paramMap.get("cPage");

        // 전체 회원 수
        int totalCnt =
                memberService.totalCount(paramMap);

        // 페이징 정보 생성
        PageVO pageVO =
                pagingService.makePage(
                        totalCnt,
                        cPage
                );


        // 검색 조건 + 페이징 조건
        Map<String, String> map =
                new HashMap<>(paramMap);

        map.put(
                "begin",
                String.valueOf(
                        pageVO.getBeginPerPage()
                )
        );

        map.put(
                "end",
                String.valueOf(
                        pageVO.getEndPerPage()
                )
        );


        // 회원 목록 조회
        List<MemberVO> list =
                memberService.list(map);


        // =====================================================
        // 응답 데이터
        // =====================================================

        Map<String, Object> response =
                new HashMap<>();

        response.put("data", list);

        response.put(
                "totalItems",
                pageVO.getTotalRecord()
        );

        response.put(
                "totalPages",
                pageVO.getTotalPage()
        );

        response.put(
                "currentPage",
                pageVO.getNowPage()
        );

        response.put(
                "startPage",
                pageVO.getStartPage()
        );

        response.put(
                "endPage",
                pageVO.getEndPage()
        );

        return response;
    }
}