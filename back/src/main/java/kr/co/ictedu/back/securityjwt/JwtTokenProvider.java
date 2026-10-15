
package kr.co.ictedu.back.securityjwt;

import java.security.Key;
import java.util.Date;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.security.Keys;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtTokenProvider {

    // JWT 생성 및 검증에 사용되는 비밀 키
    Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    // JWT 생성
    public String createToken(Authentication authentication) {

        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        Date now = new Date();

        // JWT 유효시간 1시간
        Date expiryDate =
                new Date(now.getTime() + 3600000);

        // 추가: 로그인한 사용자의 권한 가져오기
        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() ->
                    new IllegalStateException("회원 권한이 없습니다.")
                );

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("role", role) // 추가: JWT에 권한 저장
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // HTTP 요청에서 JWT 추출
    public String resolveToken(HttpServletRequest request) {

        String bearerToken =
                request.getHeader("Authorization");

        System.out.println(
                "bearerToken 값 : " +
                (StringUtils.hasText(bearerToken)
                    ? "[Authorization 헤더 존재]"
                    : "null")
        );

        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith("Bearer ")) {

            return bearerToken.substring(7);
        }

        return null;
    }

    // JWT 유효성 검사
    public boolean validateToken(String token) {

        try {

            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

            return true;

        } catch (MalformedJwtException e) {

            log.error("JWT 토큰 형식 오류");

        } catch (ExpiredJwtException e) {

            log.error("JWT 토큰 만료");

        } catch (UnsupportedJwtException e) {

            log.error("지원되지 않는 JWT");

        } catch (IllegalArgumentException e) {

            log.error("JWT 토큰이 비어 있음");

        } catch (SignatureException e) {

            log.error("JWT 서명 오류");
        }

        return false;
    }

    // JWT에서 사용자 이메일 추출
    public String getUsername(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 추가: JWT에서 권한 추출
    public String getRole(String token) {

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("role", String.class);
    }
}
