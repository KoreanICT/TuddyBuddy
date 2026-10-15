
package kr.co.ictedu.back.securitykakao;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@RestController
@RequestMapping("/api/auth/kakao")
public class KakaoAuthController {

	@Autowired
	private KakaoAuthService kakaoAuthService;

	// 추가: 기존 회원 DAO 재사용
	@Autowired
	private MemberDAO memberDAO;

	@Autowired
	private KakaoSignupRedisDao kakaoSignupRedisDao;

	// ==========================================
	// 카카오 로그인 콜백 처리
	// ==========================================
	@PostMapping("/callback")
	public ResponseEntity<?> kakaoCallback(@RequestBody Map<String, String> request) {

		String code = request.get("code");

		if (code == null || code.isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "카카오 인가 코드가 없습니다."));
		}

		String currentStep = "카카오 액세스 토큰 발급";

		try {

			// ==========================================
			// 1. 카카오 인가 코드 → 액세스 토큰
			// ==========================================
			String kakaoAccessToken = kakaoAuthService.getKakaoAccessToken(code);

			System.out.println("===== 카카오 토큰 교환 성공 =====");

			// ==========================================
			// 2. 카카오 사용자 정보 조회
			// ==========================================
			currentStep = "카카오 사용자 정보 조회";

			Map<String, Object> kakaoUser = kakaoAuthService.getKakaoUserInfo(kakaoAccessToken);

			System.out.println("===== 카카오 응답 구조 확인 =====");

// 개인정보 값은 출력하지 않고 필드 이름만 확인
			System.out.println("최상위 필드: " + kakaoUser.keySet());

			Object accountObject = kakaoUser.get("kakao_account");

			if (accountObject instanceof Map<?, ?> account) {

				System.out.println("kakao_account 필드: " + account.keySet());

				Object profileObject = account.get("profile");

				if (profileObject instanceof Map<?, ?> profile) {
					System.out.println("profile 필드: " + profile.keySet());
				}
			}

			Object propertiesObject = kakaoUser.get("properties");

			if (propertiesObject instanceof Map<?, ?> properties) {
				System.out.println("properties 필드: " + properties.keySet());
			}

			@SuppressWarnings("unchecked")
			Map<String, Object> kakaoAccount = kakaoUser.get("kakao_account") instanceof Map<?, ?>
					? (Map<String, Object>) kakaoUser.get("kakao_account")
					: Map.of();

			@SuppressWarnings("unchecked")
			Map<String, Object> profile = kakaoAccount.get("profile") instanceof Map<?, ?>
					? (Map<String, Object>) kakaoAccount.get("profile")
					: Map.of();

// 카카오에서 제공된 정보만 추출
			Map<String, String> kakaoProfile = Map.of("email", String.valueOf(kakaoAccount.getOrDefault("email", "")),

					"name", String.valueOf(kakaoAccount.getOrDefault("name", "")),

					"nickname", String.valueOf(profile.getOrDefault("nickname", "")),

					"phone", String.valueOf(kakaoAccount.getOrDefault("phone_number", "")));

			Object kakaoIdObject = kakaoUser.get("id");

			if (kakaoIdObject == null) {
				throw new IllegalStateException("카카오 사용자 고유 ID가 없습니다.");
			}

			String kakaoId = String.valueOf(kakaoIdObject);

			System.out.println("===== 카카오 사용자 정보 조회 성공 =====");

			System.out.println("===== 카카오 프로필 제공 여부 =====");

			System.out.println("이메일: " + !kakaoProfile.get("email").isBlank());

			System.out.println("이름: " + !kakaoProfile.get("name").isBlank());

			System.out.println("닉네임: " + !kakaoProfile.get("nickname").isBlank());

			System.out.println("전화번호: " + !kakaoProfile.get("phone").isBlank());

			System.out.println("닉네임 추가 동의 필요: " + kakaoAccount.get("profile_nickname_needs_agreement"));

			// ==========================================
			// 3. Oracle DB에서 카카오 회원 조회
			// ==========================================
			currentStep = "카카오 회원 DB 조회";

			MemberVO member = memberDAO.findBySocialLogin("KAKAO", kakaoId);

			// ==========================================
			// 4. 신규 카카오 회원
			// ==========================================

			if (member == null) {

				System.out.println("===== 신규 카카오 회원 확인 =====");

				// 인증된 카카오 ID와 연결되는 가입용 임시 토큰 생성
				// Redis에서 10분 동안 유효
				String signupToken = kakaoSignupRedisDao.createSignupToken(kakaoId);

				System.out.println("===== 카카오 가입용 임시 토큰 발급 성공 =====");

				// 카카오 ID나 액세스 토큰은 반환하지 않음

				return ResponseEntity.ok(Map.of("success", true, "registered", false, "signupToken", signupToken,
						"kakaoProfile", kakaoProfile, "message", "추가 정보 입력이 필요한 회원입니다."));

			}

			// ==========================================
			// 5. 기존 카카오 회원
			// ==========================================
			System.out.println("===== 기존 카카오 회원 확인 =====");

			// 아직 자체 JWT 발급 기능은 연결하지 않음
			return ResponseEntity.ok(Map.of("success", true, "registered", true, "message", "기존 카카오 회원입니다."));

		} catch (RestClientResponseException e) {

			System.out.println("===== 카카오 API 요청 실패 =====");
			System.out.println("실패 단계: " + currentStep);
			System.out.println("카카오 API HTTP 상태: " + e.getStatusCode());

			String errorBody = e.getResponseBodyAsString();

			if (errorBody.contains("KOE010")) {
				System.out.println("원인: 클라이언트 시크릿 오류");
			} else if (errorBody.contains("KOE101")) {
				System.out.println("원인: REST API 키 오류");
			} else if (errorBody.contains("KOE114")) {
				System.out.println("원인: 서로 다른 앱 키 사용");
			} else if (errorBody.contains("invalid_grant")) {
				System.out.println("원인: 인가 코드 만료 또는 재사용 가능성");
			} else if (errorBody.contains("invalid_client")) {
				System.out.println("원인: 카카오 클라이언트 인증 오류");
			} else if (errorBody.contains("redirect_uri")) {
				System.out.println("원인: Redirect URI 설정 확인 필요");
			} else {
				System.out.println("원인: 카카오 API 요청 실패");
			}

			return ResponseEntity.badRequest().body(Map.of("success", false, "message", currentStep + " 실패"));

		} catch (Exception e) {

			System.out.println("카카오 로그인 처리 실패 단계: " + currentStep);

			System.out.println("오류 유형: " + e.getClass().getSimpleName());

			return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "카카오 로그인 처리 중 오류 발생"));
		}
	}
}
