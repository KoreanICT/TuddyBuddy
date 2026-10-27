package kr.co.ictedu.back.securityauth;

import java.net.URI;
import java.time.Duration;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

// Refresh Token 쿠키 관리와 인증 요청의 출처 확인을 담당하는 공통 컴포넌트
@Component
public class AuthCookies {
    // 쿠키 이름 및 설정값

    // Refresh Token을 저장하는 쿠키 이름
    private static final String NAME = "refreshToken";

    // true면 브라우저가 HTTPS 요청에만 쿠키를 전송하도록 설정
    private final boolean secure;

    // 인증 요청을 허용할 출처 목록 (프로토콜·호스트·포트)
    private final List<String> allowedOrigins;

    // 설정값 주입 및 허용 출처 구성
    // Secure 설정은 기본 false이며 HTTPS 배포 환경에서는 설정값을 확인해야 함
    public AuthCookies(@Value("${auth.refresh-cookie-secure:false}") boolean secure,
            @Value("${security.value}") String host,
            @Value("${auth.allowed-origins:}") String extraOrigins) {
        this.secure = secure;

        // 기본 개발 주소를 등록하고 LinkedHashSet으로 중복 출처 제거
        LinkedHashSet<String> origins = new LinkedHashSet<>(List.of(
                "http://localhost:3000", "http://" + host + ":3000", "http://" + host + ":80"));

        // 쉼표로 구분한 추가 출처를 공백 정리 후 등록
        Arrays.stream(extraOrigins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).forEach(origins::add);

        // 생성 후 외부에서 변경할 수 없는 목록으로 보관
        this.allowedOrigins = List.copyOf(origins);
    }

    // 허용 출처 조회
    // 보관 중인 출처 목록을 다른 설정·인증 처리에서 사용할 수 있도록 반환
    public List<String> allowedOrigins() {
        return allowedOrigins;
    }

    // 요청 쿠키에서 Refresh Token 조회
    public String read(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        // 브라우저가 보낸 쿠키 중 이름이 refreshToken인 쿠키의 값만 반환
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // 쿠키가 없으면 null 반환. 토큰의 유효성 검증은 RefreshTokenService에서 처리
        return null;
    }

    // Refresh Token 쿠키 발급·갱신
    // 서버의 Refresh Token 유효기간을 쿠키 유지기간으로 사용
    public void set(HttpServletRequest request, HttpServletResponse response, String token) {
        write(request, response, token, RefreshTokenService.TTL);
    }

    // Refresh Token 쿠키 삭제
    // 같은 이름·경로의 쿠키에 빈 값과 Max-Age=0을 설정해 브라우저 삭제 유도
    // Redis에 저장한 토큰 폐기는 호출 측에서 별도로 처리
    public void clear(HttpServletRequest request, HttpServletResponse response) {
        write(request, response, "", Duration.ZERO);
    }

    // 쿠키 응답 공통 처리
    private void write(HttpServletRequest request, HttpServletResponse response, String token, Duration ttl) {
        // Set-Cookie 헤더로 브라우저에 쿠키 저장·갱신·삭제 지시
        response.addHeader(HttpHeaders.SET_COOKIE,
                ResponseCookie.from(NAME, token)
                        // JavaScript의 document.cookie에서 토큰에 접근하지 못하도록 제한
                        .httpOnly(true)
                        // 설정값이 true이면 HTTPS 요청에서만 쿠키 전송
                        .secure(secure)
                        // 다른 사이트에서 발생한 요청의 쿠키 전송을 일부 제한
                        // 모든 교차 출처 요청이나 CSRF를 단독으로 차단하는 설정은 아님
                        .sameSite("Lax")
                        // 인증 API 경로에만 쿠키 전송. 기본 컨텍스트가 /back이면 /back/api/auth
                        .path(request.getContextPath() + "/api/auth")
                        // 전달된 유지기간 적용. Duration.ZERO이면 즉시 만료
                        .maxAge(ttl)
                        .build()
                        .toString());

        // 인증 응답을 브라우저·중간 캐시에 저장하지 않도록 지시
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
    }

    // 인증 요청의 출처 확인
    // 갱신·로그아웃 등 이 메서드를 호출하는 API에서 허용 출처를 검사
    public void requireTrustedOrigin(HttpServletRequest request) {
        String origin = request.getHeader(HttpHeaders.ORIGIN);

        if (origin == null) {
            // Origin이 없으면 브라우저의 요청 사이트 분류를 보조적으로 확인
            // cross-site는 거절하며, 두 헤더가 모두 없는 비브라우저 요청 등은 이 검사에서 허용
            if ("cross-site".equals(request.getHeader("Sec-Fetch-Site"))) {
                forbidden();
            }
            return;
        }

        // 명시적으로 등록한 출처와 일치하면 허용
        if (allowedOrigins.contains(origin)) {
            return;
        }

        try {
            // 허용 목록에 없더라도 현재 서버와 동일한 출처인지 확인
            URI uri = URI.create(origin);

            // 포트를 생략한 경우 HTTPS는 443, 그 외는 80으로 비교
            int port = uri.getPort() == -1 ? ("https".equals(uri.getScheme()) ? 443 : 80) : uri.getPort();

            // 프로토콜·호스트·포트가 현재 요청 서버와 같아야 함
            // 사용자정보·실제 경로·쿼리·프래그먼트가 포함된 값은 허용하지 않음
            if (uri.getScheme() != null && uri.getScheme().equals(request.getScheme())
                    && uri.getHost() != null && uri.getHost().equalsIgnoreCase(request.getServerName())
                    && port == request.getServerPort() && uri.getRawUserInfo() == null
                    && (uri.getRawPath() == null || uri.getRawPath().isEmpty())
                    && uri.getRawQuery() == null && uri.getRawFragment() == null) {
                return;
            }
        } catch (IllegalArgumentException e) {
            // URI 형식이 올바르지 않으면 아래의 공통 거절 처리로 이동
        }

        // 허용 목록 및 동일 출처 조건을 모두 통과하지 못하면 거절
        forbidden();
    }

    // 허용하지 않은 요청 출처의 공통 응답
    // 출처 검사는 사용자 인증을 대체하지 않으며, 토큰 유효성 검증은 별도 수행
    private static void forbidden() {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "허용되지 않은 요청 출처입니다.");
    }
}
