package kr.co.ictedu.back.securitykakao;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.securityjwt.JwtTokenProvider;

@RestController
@RequestMapping("/api/auth/kakao")
public class KakaoSignupController {

    private final MemberService memberService;
    private final KakaoSignupRedisDao kakaoSignupRedisDao;
    private final EmailVerifiedRedisDao emailVerifiedRedisDao;
    private final JwtTokenProvider jwtTokenProvider;

    public KakaoSignupController(
            MemberService memberService,
            KakaoSignupRedisDao kakaoSignupRedisDao,
            EmailVerifiedRedisDao emailVerifiedRedisDao,
            JwtTokenProvider jwtTokenProvider) {

        this.memberService = memberService;
        this.kakaoSignupRedisDao = kakaoSignupRedisDao;
        this.emailVerifiedRedisDao = emailVerifiedRedisDao;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // ==========================================
    // 카카오 신규 회원가입 완료
    // ==========================================
    @PostMapping("/signup")
    public ResponseEntity<?> kakaoSignup(
            @RequestBody Map<String, Object> request) {

        try {

            // 1. 프론트에서 전달받은 정보
            String signupToken =
                    getString(request, "signupToken");

            String verificationToken =
                    getString(request, "verificationToken");

            String email =
                    getString(request, "email")
                    .trim().toLowerCase();

            String name =
                    getString(request, "name").trim();

            String nick =
                    getString(request, "nick").trim();

            String phone =
                    getString(request, "phone").trim();

            // 2. 필수 약관 동의 확인
            boolean termsAgree =
                    Boolean.TRUE.equals(
                        request.get("termsAgree")
                    );

            boolean privacyAgree =
                    Boolean.TRUE.equals(
                        request.get("privacyAgree")
                    );

            if (!termsAgree || !privacyAgree) {
                return badRequest(
                    "필수 약관에 동의해주세요."
                );
            }

            // 3. 필수 정보 검사
            if (signupToken.isBlank()
                    || verificationToken.isBlank()
                    || email.isBlank()
                    || name.isBlank()
                    || nick.isBlank()
                    || phone.isBlank()) {

                return badRequest(
                    "필수 정보를 모두 입력해주세요."
                );
            }

            // 4. 카카오 가입 토큰 확인
            String kakaoId =
                    kakaoSignupRedisDao.getKakaoId(
                        signupToken
                    );

            if (kakaoId == null || kakaoId.isBlank()) {
                return badRequest(
                    "카카오 가입 인증이 만료되었습니다. 다시 로그인해주세요."
                );
            }

            // 5. 이메일 인증 토큰 확인
            String verifiedEmail =
                    emailVerifiedRedisDao.getVerifiedEmail(
                        verificationToken
                    );

            if (verifiedEmail == null
                    || !verifiedEmail.equals(email)) {

                return badRequest(
                    "이메일 인증정보가 유효하지 않습니다."
                );
            }

            // 6. 가입 토큰 일회성 소비
            String consumedKakaoId =
                    kakaoSignupRedisDao.consumeSignupToken(
                        signupToken
                    );

            if (consumedKakaoId == null
                    || !consumedKakaoId.equals(kakaoId)) {

                return badRequest(
                    "카카오 가입 인증정보가 만료되었거나 이미 사용되었습니다."
                );
            }

            // 7. 이메일 인증 토큰 일회성 소비
            String consumedEmail =
                    emailVerifiedRedisDao
                        .consumeVerificationToken(
                            verificationToken
                        );

            if (consumedEmail == null
                    || !consumedEmail.equals(email)) {

                return badRequest(
                    "이메일 인증정보가 만료되었거나 이미 사용되었습니다."
                );
            }

            // 8. Oracle DB에 회원 저장
            MemberVO member =
                    memberService.createKakaoMember(
                        kakaoId,
                        email,
                        name,
                        nick,
                        phone
                    );

            // 9. 저장된 회원정보 확인
            String username = member.getMember_email();
            String authority = member.getAuthority();
            Long memberNum = member.getMember_num();

            if (username == null || username.isBlank()
                    || authority == null || authority.isBlank()
                    || memberNum == null) {

                throw new IllegalStateException(
                    "저장된 회원정보가 올바르지 않습니다."
                );
            }

            // 10. Spring Security 인증 객체 생성
            User userDetails = new User(
                username,
                "",
                List.of(
                    new SimpleGrantedAuthority(authority)
                )
            );

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );

            // 11. JWT 발급
            String accessToken =
                    jwtTokenProvider.createToken(
                        authentication
                    );

            System.out.println(
                "===== 카카오 신규 회원가입 및 JWT 발급 성공 ====="
            );

            // 12. 프론트엔드 응답
            return ResponseEntity.ok(
                Map.of(
                    "success", true,
                    "registered", true,
                    "access_token", accessToken,
                    "member_num", memberNum,
                    "authority", authority,
                    "username", username,
                    "message", "카카오 회원가입이 완료되었습니다."
                )
            );

        } catch (IllegalArgumentException e) {

            return badRequest(e.getMessage());

        } catch (DataIntegrityViolationException e) {

            return ResponseEntity.status(409).body(
                Map.of(
                    "success", false,
                    "message",
                    "이미 등록된 이메일, 닉네임 또는 카카오 계정입니다."
                )
            );

        } catch (Exception e) {

            System.err.println(
                "카카오 회원가입 오류 유형: "
                + e.getClass().getSimpleName()
            );

            return ResponseEntity.internalServerError().body(
                Map.of(
                    "success", false,
                    "message",
                    "카카오 회원가입 중 오류가 발생했습니다."
                )
            );
        }
    }

    // ==========================================
    // 요청에서 문자열 안전하게 추출
    // ==========================================
    private String getString(
            Map<String, Object> request,
            String key) {

        Object value = request.get(key);

        return value instanceof String
                ? (String) value
                : "";
    }

    // ==========================================
    // 오류 응답 공통 처리
    // ==========================================
    private ResponseEntity<?> badRequest(String message) {

        return ResponseEntity.badRequest().body(
            Map.of(
                "success", false,
                "message", message
            )
        );
    }
}