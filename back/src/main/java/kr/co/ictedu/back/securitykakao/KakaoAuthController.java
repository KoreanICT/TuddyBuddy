package kr.co.ictedu.back.securitykakao;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.securityjwt.JwtTokenProvider;
import kr.co.ictedu.back.securityauth.RefreshTokenService;
import kr.co.ictedu.back.securityauth.AuthCookies;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth/kakao")
public class KakaoAuthController {

	@Autowired
	private KakaoAuthService kakaoAuthService;

	@Autowired
	private MemberDAO memberDAO;

	@Autowired
	private KakaoSignupRedisDao kakaoSignupRedisDao;

	// JWT 발급 클래스 추가
	@Autowired
	private JwtTokenProvider jwtTokenProvider;

	@Autowired
	private RefreshTokenService refreshTokens;

	@Autowired
	private AuthCookies authCookies;

	// ==========================================
	// 카카오 로그인 콜백 처리
	// ==========================================
	@PostMapping("/callback")
	public ResponseEntity<?> kakaoCallback(@RequestBody Map<String, String> request,
			HttpServletRequest servletRequest, HttpServletResponse servletResponse) {

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

			// 개인정보 값은 출력하지 않음
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

			// ==========================================
			// 3. 카카오 프로필 정보 추출
			// ==========================================

			// 컴파일 경고를 사용하지 않도록 설정해주는 것
			@SuppressWarnings("unchecked")
			Map<String, Object> kakaoAccount = kakaoUser.get("kakao_account") instanceof Map<?, ?>
					? (Map<String, Object>) kakaoUser.get("kakao_account")
					: Map.of();

			@SuppressWarnings("unchecked")
			Map<String, Object> profile = kakaoAccount.get("profile") instanceof Map<?, ?>
					? (Map<String, Object>) kakaoAccount.get("profile")
					: Map.of();

			// 카카오 이메일 추출
			Object emailValue = kakaoAccount.get("email");
			System.out.println("===== 카카오 이메일 제공 상태 =====");

			System.out.println(
			    "이메일 동의 필요: "
			    + kakaoAccount.get("account_email_needs_agreement")
			);

			System.out.println(
			    "이메일 제공 가능: "
			    + kakaoAccount.get("is_email_valid")
			);

			System.out.println(
			    "이메일 인증 여부: "
			    + kakaoAccount.get("is_email_verified")
			);

			System.out.println(
			    "이메일 필드 존재: "
			    + kakaoAccount.containsKey("email")
			);

			String kakaoEmail = emailValue instanceof String ? ((String) emailValue).trim() : "";

			// 이름
			String kakaoName = kakaoAccount.get("name") instanceof String ? (String) kakaoAccount.get("name") : "";

			// 닉네임
			String kakaoNickname = profile.get("nickname") instanceof String ? (String) profile.get("nickname") : "";

			// 전화번호
			String kakaoPhone = kakaoAccount.get("phone_number") instanceof String
					? (String) kakaoAccount.get("phone_number")
					: "";

			// 프론트엔드에 전달할 정보
			Map<String, String> kakaoProfile = Map.of("email", kakaoEmail, "name", kakaoName, "nickname", kakaoNickname,
					"phone", kakaoPhone);

			// ==========================================
			// 4. 카카오 사용자 고유 ID 추출
			// ==========================================

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
			// 5. Oracle DB에서 카카오 회원 조회
			// ==========================================

			currentStep = "카카오 회원 DB 조회";

			MemberVO member = memberDAO.findBySocialLogin("KAKAO", kakaoId);

			// ==========================================
			// 6. 신규 카카오 회원
			// ==========================================

			if (member == null) {

				System.out.println("===== 신규 카카오 회원 확인 =====");

				// Redis에 가입용 임시 토큰 저장
				// 유효기간 10분
				String signupToken = kakaoSignupRedisDao.createSignupToken(kakaoId,kakaoProfile.get("email"));

				System.out.println("===== 카카오 가입용 임시 토큰 발급 성공 =====");

				// 아직 회원가입이 완료된 것은 아님
				// 프론트에서 추가정보 입력 화면으로 이동

				return ResponseEntity.ok(Map.of("success", true, "registered", false, "signupToken", signupToken,
						"kakaoProfile", kakaoProfile, "message", "추가 정보 입력이 필요한 회원입니다."));
			}

			// ==========================================
			// 7. 기존 카카오 회원 JWT 로그인
			// ==========================================

			currentStep = "기존 카카오 회원 JWT 발급";

			System.out.println("===== 기존 카카오 회원 확인 =====");

			// DB에서 조회한 회원정보 사용
			String username = member.getMember_email();
			String authority = member.getAuthority();

			Long memberNum = member.getMember_num();

			// 필수 회원정보 확인
			if (username == null || username.isBlank()) {
				throw new IllegalStateException("회원 이메일 정보가 없습니다.");
			}

			if (authority == null || authority.isBlank()) {
				throw new IllegalStateException("회원 권한 정보가 없습니다.");
			}

			if (memberNum == null) {
				throw new IllegalStateException("회원번호가 없습니다.");
			}

			// ==========================================
			// 8. Spring Security UserDetails 생성
			// ==========================================

			// 카카오에서 이미 인증이 완료된 회원
			// 비밀번호 재인증은 진행하지 않음

			User userDetails = new User(username, "", java.util.List.of(new SimpleGrantedAuthority(authority)));

			// ==========================================
			// 9. Authentication 객체 생성
			// ==========================================

			Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null,
					userDetails.getAuthorities());

			// ==========================================
			// 10. 기존 JwtTokenProvider로 JWT 발급
			// ==========================================

			String accessToken = jwtTokenProvider.createToken(authentication);

			refreshTokens.revoke(authCookies.read(servletRequest));
			authCookies.set(servletRequest, servletResponse, refreshTokens.issue(member));

			System.out.println("===== 카카오 회원 JWT 발급 성공 =====");

			// ==========================================
			// 11. 프론트엔드에 로그인 결과 반환
			// ==========================================

			return ResponseEntity.ok(Map.of("success", true, "registered", true, "access_token", accessToken,
					"member_num", memberNum, "authority", authority, "username", username, "message", "카카오 로그인 성공"));

		} catch (ResponseStatusException e) {
			throw e;
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
