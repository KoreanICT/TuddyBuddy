// 최원철
package kr.co.ictedu.back.securityauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.securityjwt.AuthRequest;
import kr.co.ictedu.back.securityjwt.AuthResponse;
import kr.co.ictedu.back.securityjwt.JwtTokenProvider;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.ictedu.back.member.service.LoginLogService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // 의존성 주입
	
    // Spring Security 사용자 인증 처리
    @Autowired
    private AuthenticationManager authenticationManager;

    // JWT Access Token 생성
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // 회원정보 조회
    @Autowired
    private MemberDAO memberDao;

    // Refresh Token 발급 및 관리
    @Autowired
    private RefreshTokenService refreshTokens;

    // Refresh Token 쿠키 조회 및 설정
    @Autowired
    private AuthCookies authCookies;

    // 로그인 성공 및 실패 기록
    @Autowired
    private LoginLogService loginLogs;

    // 일반 회원 로그인
    @PostMapping("/login")
    public ResponseEntity<?> authUser(
            @RequestBody AuthRequest authRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        try {
            // 이메일 및 비밀번호 인증
            // AuthenticationManager를 통해 사용자 인증 수행
            Authentication authentication =
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        authRequest.getUsername(),
                        authRequest.getPassword()
                    )
                );

            System.out.println("Authentication 호출 후");

            // Spring Security 인증정보 저장
            // 인증된 사용자 정보를 SecurityContext에 등록
            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            // JWT Access Token 발급
            // 인증된 사용자 정보를 기반으로 JWT 생성
            String jwt = jwtTokenProvider.createToken(authentication);

            // 인증된 회원정보 조회
            // 인증 객체에서 이메일 추출
            String email = authentication.getName();

            // 이메일을 기준으로 DB에서 회원정보 조회
            MemberVO member = memberDao.getMemberByEmail(email);

            // 회원정보가 존재하지 않는 경우 404 반환
            if (member == null) {
                return ResponseEntity.status(404).body("회원정보를 찾을 수 없습니다.");
            }

            // 회원번호 및 권한 조회
            // 로그인 응답에 포함할 회원번호와 권한 추출
            Long member_num = member.getMember_num();
            String authority = member.getAuthority();

            // 기존 Refresh Token 폐기
            // 요청 쿠키에서 기존 Refresh Token을 조회하여 폐기
            refreshTokens.revoke(authCookies.read(request));

            // 신규 Refresh Token 발급 및 저장
            // 인증된 회원의 새로운 Refresh Token 발급
            String refreshToken = refreshTokens.issue(member);

            // 발급한 Refresh Token을 응답 쿠키에 저장
            authCookies.set(request, response, refreshToken);

            // 로그인 성공 기록
            // Refresh Token 및 요청정보를 기반으로 로그인 기록 저장
            refreshTokens.recordLogin(member, refreshToken, request);
            System.out.println("===== 로그인 성공 =====");

            // 로그인 성공 응답 반환
            // JWT Access Token, 회원번호, 권한 반환
            return ResponseEntity.ok(
                new AuthResponse(
                    jwt, member_num, authority)
            );

        } catch (
            org.springframework.security.core.AuthenticationException e
        ) {
            // 로그인 인증 실패 처리
            // 로그인 실패 사용자 및 요청정보 기록
            loginLogs.failure(authRequest.getUsername(), request);

            // 인증 실패 예외 출력
            System.out.println("인증 실패 예외 : "
                    + e.getClass().getSimpleName());

            // 인증 실패 시 HTTP 401 반환
            return ResponseEntity.status(401).body("이메일 또는 비밀번호 인증에 실패했습니다.");
        }
    }
}