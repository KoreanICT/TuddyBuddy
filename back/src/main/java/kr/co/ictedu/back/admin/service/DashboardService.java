package kr.co.ictedu.back.admin.service;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.admin.dao.DashboardDao;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.securityauth.MemberRoles;

@Service
public class DashboardService {
    private final DashboardDao dashboardDao;
    private final MemberDAO memberDao;

    public DashboardService(DashboardDao dashboardDao, MemberDAO memberDao) {
        this.dashboardDao = dashboardDao;
        this.memberDao = memberDao;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> overview(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO member = memberDao.getMemberByEmail(authentication.getName());
        if (member == null || !MemberRoles.isManager(member.getAuthority())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
        }
        return Map.of("summary", dashboardDao.summary(),
                "recentMembers", dashboardDao.recentMembers(), "recentPosts", dashboardDao.recentPosts(),
                "signupTrend", dashboardDao.signupTrend(), "reportStatusCounts", dashboardDao.reportStatusCounts());
    }
}
