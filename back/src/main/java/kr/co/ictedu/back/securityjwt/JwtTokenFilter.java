package kr.co.ictedu.back.securityjwt;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataAccessException;
import io.jsonwebtoken.JwtException;

// JWT 인증을 위한 클래스이다.
@Component
@AllArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {
	
	@Autowired
	private JwtTokenProvider jwtTokenProvider;
	
	private UserDetailsService userDetailsService;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getRequestURI().substring(request.getContextPath().length());
		// Documentation remains accessible even if the browser sends an expired JWT.
		if ("GET".equals(request.getMethod()) && (
				"/swagger-ui.html".equals(path) || "/swagger-ui".equals(path)
				|| path.startsWith("/swagger-ui/") || "/v3/api-docs".equals(path)
				|| path.startsWith("/v3/api-docs/"))) {
			return true;
		}
		return "/api/auth/refresh".equals(path) || "/api/auth/logout".equals(path);
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
		String token = jwtTokenProvider.resolveToken(request);
		if(token != null && jwtTokenProvider.validateToken(token)) {
			
			UserDetails userDetails = userDetailsService.loadUserByUsername(jwtTokenProvider.getUsername(token));
			
			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
					userDetails, null, userDetails.getAuthorities()
					);
			authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
			// 이후의 요청 처리 과저에서 현재 사용자가 인증되었음을 SecurityContextHolder를 통해서 넘긴다.
			SecurityContextHolder.getContext().setAuthentication(authentication);
			// filterChain.doFilter(request, response) 호출해서 요청 처리를 계속 진행한다.(필터에 합류)
			
		}
		} catch (UsernameNotFoundException | JwtException e) {
			SecurityContextHolder.clearContext();
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			return;
		} catch (ResponseStatusException e) {
			SecurityContextHolder.clearContext();
			response.setStatus(e.getStatusCode().value());
			return;
		} catch (DataAccessException e) {
			SecurityContextHolder.clearContext();
			response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
			return;
		}
		// 모든 요청에 JWT토큰의 유효성 검사해서 유요한 토큰이 있을 경우 해당 사용자의 정보를 인증 , 정보를 설정하는 역할
		// 인증 후에 Spring Security의 다른 컴포넌트들이 이 인증 정보를 사용하도록 해서 사용자에 대한 접근 정보를 제어
		filterChain.doFilter(request, response);
	}
	
}
