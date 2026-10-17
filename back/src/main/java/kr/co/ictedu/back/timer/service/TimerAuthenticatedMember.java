// 최솔
package kr.co.ictedu.back.timer.service;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class TimerAuthenticatedMember {

    private final MemberDAO memberDAO;

    public TimerAuthenticatedMember(MemberDAO memberDAO) {
        this.memberDAO = memberDAO;
    }

    // JWT 인증된 로그인 회원의 member_num 반환
    public Long requireMemberNum() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        // 로그인 인증 정보 확인
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "로그인이 필요합니다."
            );
        }

        // JWT subject에 저장된 이메일
        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "로그인 회원 이메일을 확인할 수 없습니다."
            );
        }

        // 기존 회원 DAO 재사용 (수정하지 않음)
        MemberVO member = memberDAO.getMemberByEmail(email);

        if (member == null || member.getMember_num() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "로그인 회원 정보를 찾을 수 없습니다."
            );
        }

        return member.getMember_num();
    }
}