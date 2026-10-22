
package kr.co.ictedu.back.securitykakao;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class KakaoAuthService {

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    private final RestClient restClient = RestClient.create();

    // ==========================================
    // 1. 카카오 인가 코드를 액세스 토큰으로 교환
    // ==========================================
    public String getKakaoAccessToken(String code) {

        MultiValueMap<String, String> params =
                new LinkedMultiValueMap<>();

        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
                .uri("https://kauth.kakao.com/oauth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(params)
                .retrieve()
                .body(Map.class);

        if (response == null ||
                !(response.get("access_token") instanceof String)) {

            throw new IllegalStateException(
                    "카카오 액세스 토큰 발급에 실패했습니다."
            );
        }

        return (String) response.get("access_token");
    }

    // ==========================================
    // 2. 카카오 액세스 토큰으로 사용자 정보 조회
    // ==========================================
    public Map<String, Object> getKakaoUserInfo(String accessToken) {

        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalArgumentException(
                    "카카오 액세스 토큰이 없습니다."
            );
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.get()
                .uri("https://kapi.kakao.com/v2/user/me")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("id") == null) {

            throw new IllegalStateException(
                    "카카오 사용자 정보를 조회하지 못했습니다."
            );
        }

        return response;
    }
}
