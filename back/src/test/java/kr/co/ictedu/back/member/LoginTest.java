
package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import kr.co.ictedu.back.securityjwt.JwtTokenProvider;

@SpringBootTest
public class LoginTest {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String email;
    private String password;

    @BeforeEach
    void setUp() {
        // 실제 회원가입 테스트에서 DB에 저장한 계정
        email = "testcea0b903@example.com";
        password = "Test1234!";
    }

    // =========================
    // 로그인 성공 + JWT 발급
    // =========================
    @Test
    void loginSuccessTest() {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );

        assertTrue(authentication.isAuthenticated());

        String token = jwtTokenProvider.createToken(authentication);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(email, jwtTokenProvider.getUsername(token));

        System.out.println("==================================");
        System.out.println("로그인 성공");
        System.out.println("이메일 : " + authentication.getName());
        System.out.println("JWT 발급 성공");
        System.out.println("JWT 유효성 검사 성공");
        System.out.println("==================================");
        System.out.println("JWT Access Token : " + token);
    }

    // =========================
    // 비밀번호 불일치
    // =========================
    @Test
    void loginWrongPasswordTest() {
        assertThrows(BadCredentialsException.class, () -> {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, "WrongPassword123!")
            );
        });

        System.out.println("잘못된 비밀번호 로그인 차단 성공");
    }
}
