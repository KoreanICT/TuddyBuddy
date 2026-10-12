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

@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class AuthController {

	@Autowired
	private AuthenticationManager authenticationManager;
	
	@Autowired
	private JwtTokenProvider jwtTokenProvider;
	
	@PostMapping("/login")
	public ResponseEntity<?> authUser(@RequestBody AuthRequest authRequest) {
		System.out.println("===== 로그인 컨트롤러 진입 =====");
		System.out.println("로그인 이메일 : " + authRequest.getUsername());
		System.out.println("");
		try {

		    Authentication authentication = authenticationManager.authenticate(
		        new UsernamePasswordAuthenticationToken(
		            authRequest.getUsername(),
		            authRequest.getPassword()
		        )
		    );

		    System.out.println("Authentication 호출 후");

		    SecurityContextHolder.getContext().setAuthentication(authentication);

		    String jwt = jwtTokenProvider.createToken(authentication);

		    return ResponseEntity.ok(new AuthResponse(jwt));

		} catch (org.springframework.security.core.AuthenticationException e) {

		    System.out.println("인증 실패 예외 : " + e.getClass().getSimpleName());

		    return ResponseEntity.status(401)
		            .body("이메일 또는 비밀번호 인증에 실패했습니다.");
		}
}
}