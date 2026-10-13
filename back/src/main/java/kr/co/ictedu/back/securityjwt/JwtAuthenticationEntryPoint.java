package kr.co.ictedu.back.securityjwt;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// 스프링 시큐리티에서 인증 실패 했을 때 처리하는 클래스
// BasicAuthenticationEntryPoint 기본적인 HTTP 기반 인증 실패 처리를 구현한 클래스 클래스
@Component
public class JwtAuthenticationEntryPoint extends BasicAuthenticationEntryPoint {
	// Bean의 속성이 설정된 후에 호출이 되는 메서드 , 조금전에 테스트 해봤음
	@Override
	public void afterPropertiesSet() {
		setRealmName("JWT Authentication");
	}

	// AuthenticationException : 인증 실패와 관련된 예의 정보를 가지고 있는 객체
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException {
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		// MIME TYPE을 Json 타입으로 처리
		
		response.setContentType("application/json");
		response.getWriter().write("{ \"message\": \"" + authException.getMessage() + "\"}");
	}
	
}