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

@Component
public class AuthCookies {
    private static final String NAME = "refreshToken";
    private final boolean secure;
    private final List<String> allowedOrigins;

    public AuthCookies(@Value("${auth.refresh-cookie-secure:false}") boolean secure,
            @Value("${security.value}") String host,
            @Value("${auth.allowed-origins:}") String extraOrigins) {
        this.secure = secure;
        LinkedHashSet<String> origins = new LinkedHashSet<>(List.of(
                "http://localhost:3000", "http://" + host + ":3000", "http://" + host + ":80"));
        Arrays.stream(extraOrigins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).forEach(origins::add);
        this.allowedOrigins = List.copyOf(origins);
    }

    public List<String> allowedOrigins() { return allowedOrigins; }

    public String read(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) if (NAME.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }

    public void set(HttpServletRequest request, HttpServletResponse response, String token) {
        write(request, response, token, RefreshTokenService.TTL);
    }

    public void clear(HttpServletRequest request, HttpServletResponse response) {
        write(request, response, "", Duration.ZERO);
    }

    private void write(HttpServletRequest request, HttpServletResponse response, String token, Duration ttl) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(NAME, token)
                .httpOnly(true).secure(secure).sameSite("Lax")
                .path(request.getContextPath() + "/api/auth").maxAge(ttl).build().toString());
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
    }

    public void requireTrustedOrigin(HttpServletRequest request) {
        String origin = request.getHeader(HttpHeaders.ORIGIN);
        if (origin == null) {
            // Browser fetch metadata guards requests without Origin; non-browser clients may omit it.
            if ("cross-site".equals(request.getHeader("Sec-Fetch-Site"))) forbidden();
            return;
        }
        if (allowedOrigins.contains(origin)) return;
        try {
            URI uri = URI.create(origin);
            int port = uri.getPort() == -1 ? ("https".equals(uri.getScheme()) ? 443 : 80) : uri.getPort();
            if (uri.getScheme() != null && uri.getScheme().equals(request.getScheme())
                    && uri.getHost() != null && uri.getHost().equalsIgnoreCase(request.getServerName())
                    && port == request.getServerPort() && uri.getRawUserInfo() == null
                    && (uri.getRawPath() == null || uri.getRawPath().isEmpty())
                    && uri.getRawQuery() == null && uri.getRawFragment() == null) return;
        } catch (IllegalArgumentException e) {
            // Invalid and opaque origins are not trusted.
        }
        forbidden();
    }

    private static void forbidden() {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "허용되지 않은 요청 출처입니다.");
    }
}
