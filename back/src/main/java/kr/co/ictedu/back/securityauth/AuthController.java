
package kr.co.ictedu.back.securityauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.securityjwt.AuthRequest;
import kr.co.ictedu.back.securityjwt.AuthResponse;
import kr.co.ictedu.back.securityjwt.JwtTokenProvider;

// 추가
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // 추가: 회원정보 조회
    @Autowired
    private MemberDAO memberDao;

    @PostMapping("/login")
    public ResponseEntity<?> authUser(
            @RequestBody AuthRequest authRequest) {

        System.out.println("===== 로그인 컨트롤러 진입 =====");
        System.out.println("로그인 이메일 : "
                + authRequest.getUsername());

        try {

            // 기존 로그인 인증
            Authentication authentication =
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        authRequest.getUsername(),
                        authRequest.getPassword()
                    )
                );

            System.out.println("Authentication 호출 후");

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            // 기존 JWT 생성
            String jwt =
                    jwtTokenProvider.createToken(authentication);

            // 추가: 인증된 이메일로 회원정보 조회
            String email = authentication.getName();

            MemberVO member =
                    memberDao.getMemberByEmail(email);

            if (member == null) {
                return ResponseEntity.status(404)
                        .body("회원정보를 찾을 수 없습니다.");
            }

            // 추가: 회원번호와 권한
            Long member_num = member.getMember_num();
            String authority = member.getAuthority();

            // 로그인 성공 로그
            System.out.println("===== 로그인 성공 =====");
            System.out.println("회원번호 : " + member_num);
            System.out.println("권한 : " + authority);

            // JWT + 회원번호 + 권한 반환
            return ResponseEntity.ok(
                new AuthResponse(
                    jwt,
                    member_num,
                    authority
                )
            );

        } catch (
            org.springframework.security.core.AuthenticationException e
        ) {

            System.out.println("인증 실패 예외 : "
                    + e.getClass().getSimpleName());

            return ResponseEntity.status(401)
                    .body("이메일 또는 비밀번호 인증에 실패했습니다.");
        }
    }
}
