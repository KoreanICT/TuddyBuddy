package kr.co.ictedu.back.group.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@Service
public class CurrentMemberService {

    private final MemberDAO memberDao;

    public CurrentMemberService(MemberDAO memberDao) {
        this.memberDao = memberDao;
    }

    public Long getCurrentMemberNum() {

        Authentication authentication = SecurityContextHolder
                    .getContext()
                    .getAuthentication();

        if (authentication == null ||
            !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                "로그인한 사용자 정보가 없습니다."
            );
        }

        String email = authentication.getName();
        MemberVO member = memberDao.getMemberByEmail(email);
        if (member == null) {
            throw new IllegalStateException(
                "회원 정보를 찾을 수 없습니다."
            );
        }

        return member.getMember_num();
    }
}