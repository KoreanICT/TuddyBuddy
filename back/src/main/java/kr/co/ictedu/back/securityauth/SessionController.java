package kr.co.ictedu.back.securityauth;

import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.securityjwt.JwtTokenProvider;

@RestController
@RequestMapping("/api/auth")
public class SessionController {
    private final RefreshTokenService refreshTokens;
    private final AuthCookies cookies;
    private final JwtTokenProvider jwt;

    public SessionController(RefreshTokenService refreshTokens, AuthCookies cookies, JwtTokenProvider jwt) {
        this.refreshTokens = refreshTokens;
        this.cookies = cookies;
        this.jwt = jwt;
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        cookies.requireTrustedOrigin(request);
        try {
            jwt.ensureReady();
            RefreshTokenService.Rotation rotation = refreshTokens.rotate(cookies.read(request));
            MemberVO member = rotation.member();
            User user = new User(member.getMember_email(), "", List.of(new SimpleGrantedAuthority(member.getAuthority())));
            String accessToken = jwt.createToken(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
            cookies.set(request, response, rotation.token());
            return ResponseEntity.ok(Map.of("accessToken", accessToken, "member_num", member.getMember_num(),
                    "authority", member.getAuthority(), "username", member.getMember_email()));
        } catch (ResponseStatusException e) {
            if (e.getStatusCode().value() == 401) cookies.clear(request, response);
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        cookies.requireTrustedOrigin(request);
        refreshTokens.revoke(cookies.read(request));
        cookies.clear(request, response);
        return ResponseEntity.noContent().build();
    }
}
