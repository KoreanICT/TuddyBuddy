package kr.co.ictedu.back.securityjwt;

import java.security.Key;
import java.util.Date;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import kr.co.ictedu.back.securityauth.RefreshTokenService;

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
    private volatile Key key;
    private final StringRedisTemplate redis;
    private final long accessTtlMillis;

    public JwtTokenProvider(StringRedisTemplate redis,
            @Value("${JWT_SECRET:}") String configuredSecret,
            @Value("${auth.access-token-ttl-seconds:900}") long accessTtlSeconds) {
        this.redis = redis;
        if (accessTtlSeconds <= 0 || accessTtlSeconds > 86400) {
            throw new IllegalArgumentException("Access token TTL must be between 1 and 86400 seconds");
        }
        this.accessTtlMillis = accessTtlSeconds * 1000;
        if (!configuredSecret.isBlank()) this.key = decodeKey(configuredSecret);
    }

    private static Key decodeKey(String secret) {
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("JWT_SECRET must be Base64 encoded");
        }
        if (bytes.length < 64) throw new IllegalArgumentException("JWT_SECRET must contain at least 64 decoded bytes");
        return Keys.hmacShaKeyFor(bytes);
    }

    private Key signingKey() {
        if (key != null) return key;
        synchronized (this) {
            if (key != null) return key;
            try {
                String name = "tuddy:auth:jwt-signing-key";
                String candidate = Base64.getEncoder().encodeToString(Keys.secretKeyFor(SignatureAlgorithm.HS512).getEncoded());
                redis.opsForValue().setIfAbsent(name, candidate);
                String shared = redis.opsForValue().get(name);
                if (shared == null) throw RefreshTokenService.unavailable();
                key = decodeKey(shared);
                return key;
            } catch (DataAccessException e) {
                throw RefreshTokenService.unavailable();
            }
        }
    }

    public void ensureReady() {
        signingKey();
    }

    // JWT 생성
    public String createToken(Authentication authentication) {

        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        Date now = new Date();

        // JWT 기본 유효시간 15분 (auth.access-token-ttl-seconds 설정 가능)
        Date expiryDate =
                new Date(now.getTime() + accessTtlMillis);

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
                .signWith(signingKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // HTTP 요청에서 JWT 추출
    public String resolveToken(HttpServletRequest request) {

        String bearerToken =
                request.getHeader("Authorization");

        System.out.println(
                "bearerToken 값 : " + (StringUtils.hasText(bearerToken) ? "[Authorization 헤더 존재]" : "null"));
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
                    .setSigningKey(signingKey())
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
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 추가: JWT에서 권한 추출
    public String getRole(String token) {

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("role", String.class);
    }
}
