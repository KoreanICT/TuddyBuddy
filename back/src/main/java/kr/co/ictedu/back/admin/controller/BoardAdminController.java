package kr.co.ictedu.back.admin.controller;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.admin.service.BoardAdminService;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.securityauth.MemberRoles;

@RestController
@RequestMapping("/api/admin/board")
public class BoardAdminController {
    private final BoardAdminService service;
    private final MemberService members;
    public BoardAdminController(BoardAdminService service, MemberService members) {
        this.service = service; this.members = members;
    }
    private void requireManager(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        var member = members.getMemberByEmail(authentication.getName());
        if (member == null || !MemberRoles.isManager(member.getAuthority()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
    }
    @GetMapping
    public Map<String, Object> list(@RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "keyword", defaultValue = "") String keyword, Authentication authentication) {
        requireManager(authentication);
        return service.list(page, keyword);
    }
    @DeleteMapping("/{num}")
    public Map<String, Boolean> delete(@PathVariable("num") Long num, Authentication authentication) {
        requireManager(authentication); service.delete(num);
        return Map.of("success", true);
    }
}
