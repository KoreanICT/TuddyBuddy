package kr.co.ictedu.back.securityjwt;

import java.util.List;
import kr.co.ictedu.back.securityauth.MemberRoles;
import kr.co.ictedu.back.securityauth.AuthCookies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.DispatcherType;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

	@Autowired
	private AuthCookies authCookies;

	// JWT 토큰을 검증하는 필터
	@Autowired
	private JwtTokenFilter jwtTokenFilter;
	// 사용자 상세 정보를 제공하는 서비스
	@Autowired
	private UserDetailsService userDetailsService;

	// 단방향 비밀번호 인코딩 -> 시큐리티는 데이터 베이스에 저장할 때 암호화 해서 저장
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public DaoAuthenticationProvider daoAuthenticationProvider() {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

		provider.setPasswordEncoder(passwordEncoder());
		return provider;
	}

	// BCryptPasswordEncoder를 사용하여 비밀번호를 암호화하는 PasswordEncoder 객체를 생성
	// BCryptPasswordEncoder는 비밀번호를 안전하게 저장하기 위한 현대적인 해시 알고리즘을 사용
	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf((csrf) -> csrf.disable())
				// .csrf((csrf) -> csrf.disable())
				// 리액트와 크로스 통신 및 리액트의 view를 사용
				.cors((cors) -> cors.configurationSource(corsConfigurationSource()))
				.formLogin((login) -> login.disable()).httpBasic((basic) -> basic.disable())
				.authorizeHttpRequests((auth) -> auth
						.dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
						.requestMatchers("/api/auth/**").permitAll() // /api/auth/** 에서 오는 모든 요청은 허용
						.requestMatchers("/api/notice/noticeList","/api/notice/noticeDetail").permitAll() // 공지사항 비회원도 접근 가능하게 변경
						.requestMatchers("/api/chatbot/session", "/api/chatbot/ai", "/api/chatbot/message/session/*").permitAll() // Chatbot 회원/비회원 공통 API
						.requestMatchers("/api/member/admin/signup").denyAll().requestMatchers("/api/member/admin/**")
						.hasAuthority(MemberRoles.ADMIN)
						.requestMatchers("/api/admin/dashboard", "/api/member/memberList", "/api/selfstudy/admin/**", "/api/notice/noticeAdd",
								"/api/notice/noticeUpdate", "/api/notice/noticeDelete", "/api/report/reportList",
								"/api/report/reportStatusUpdate", "/api/report/reportReplyAdd",
								"/api/report/reportReplyUpdate", "/api/report/reportReplyDelete",
								"/api/report/reportDelete")
						.hasAnyAuthority(MemberRoles.ADMIN, MemberRoles.SUB_ADMIN)
						.requestMatchers("/api/member/withdraw").authenticated()
            .requestMatchers("/api/member/**").permitAll()
						.requestMatchers("/uploads/**").permitAll() // 이미지 경로도 열어줘야 한다.
						.requestMatchers("/imgfile/**").permitAll()
            .requestMatchers(HttpMethod.GET,"/api/group/tags/search","/api/group/getpublicrooms","/api/group/thumbnail/**").permitAll()
//                        .requestMatchers("/**").permitAll()
						.anyRequest().authenticated()) // 모든 요청에 대해 인증을 요구
				// JWT 토큰 필터 추가: JwtTokenFilter를 BasicAuthenticationFilter 전에 추가하여 JWT 토큰을 검증
				.addFilterBefore(jwtTokenFilter, BasicAuthenticationFilter.class)
				// 세션 정책 설정: SessionCreationPolicy.STATELESS로 설정하여 세션 기반 인증을 사용하지 않도록 한다.
				.sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(errors -> errors
						.authenticationEntryPoint((request, response, exception) -> response.setStatus(401))
						.accessDeniedHandler((request, response, exception) -> response.setStatus(403)))
				// 로그아웃 기능 비활성화
				.logout((logout) -> logout.disable());
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration corsConfiguration = new CorsConfiguration();
		corsConfiguration.setAllowCredentials(true);
		corsConfiguration.setAllowedOrigins(authCookies.allowedOrigins());
		corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		corsConfiguration.setAllowedHeaders(List.of("*"));

		UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
		urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

		return urlBasedCorsConfigurationSource;

	}// corsConfigurationSource

	public static void main(String[] args) {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		System.out.println(encoder.encode("1122"));
	}

}
