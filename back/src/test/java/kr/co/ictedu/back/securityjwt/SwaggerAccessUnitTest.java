package kr.co.ictedu.back.securityjwt;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SwaggerAccessUnitTest {
    private final JwtTokenFilter filter = new JwtTokenFilter(null, null);

    private MockHttpServletRequest request(String method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, "/back" + path);
        request.setContextPath("/back");
        request.addHeader("Authorization", "Bearer expired-or-invalid-token");
        return request;
    }

    @Test
    void documentationGetRequestsSkipJwtIncludingContextPath() {
        for (String path : new String[]{"/swagger-ui.html", "/swagger-ui/index.html",
                "/swagger-ui/swagger-ui-bundle.js", "/v3/api-docs", "/v3/api-docs/swagger-config"}) {
            assertTrue(filter.shouldNotFilter(request("GET", path)), path);
        }
    }

    @Test
    void businessApisAndSimilarPrefixesStillUseJwtFilter() {
        for (String path : new String[]{"/api/member/me", "/api/admin/dashboard",
                "/v3/api-docs-private", "/swagger-ui-private"}) {
            assertFalse(filter.shouldNotFilter(request("GET", path)), path);
        }
        assertFalse(filter.shouldNotFilter(request("POST", "/v3/api-docs")));
    }

    @Test
    void refreshAndLogoutContinueToSkipJwtFilter() {
        assertTrue(filter.shouldNotFilter(request("POST", "/api/auth/refresh")));
        assertTrue(filter.shouldNotFilter(request("POST", "/api/auth/logout")));
    }
}
