package kr.co.ictedu.back.selfstudy.service;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** JWT principal(email) -> member 패키지의 MemberDAO에서 회원번호 조회. */
@Component
public class AuthenticatedMember {
	private final MemberDAO memberDAO;

	public AuthenticatedMember(MemberDAO memberDAO) {
		this.memberDAO = memberDAO;
	}

	public MemberVO require() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null
				|| "anonymousUser".equals(auth.getPrincipal())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		MemberVO member = memberDAO.getMemberByEmail(auth.getName());
		if (member == null || member.getMember_num() == null)
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "회원 정보를 확인할 수 없습니다.");
		return member;
	}

	public Long requireId() {
		return require().getMember_num();
	}

	public void requireAdmin() {
		MemberVO member = require();
		if (!"ADMIN".equals(member.getAuthority()))
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
	}
}
