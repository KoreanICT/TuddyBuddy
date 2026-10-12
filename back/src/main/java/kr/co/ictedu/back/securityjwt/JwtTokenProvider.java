package kr.co.ictedu.back.securityjwt;

import java.security.Key;
import java.util.Date;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

// @Slf4j 어노테이션 : Lombok 라이브러리의 Slf4j 어노테이션을 사용하여 로깅을 위한 Logger를 자동으로 생성
@Component
@Slf4j
public class JwtTokenProvider {
	// Key key : JWT 생성 및 검증에 사용되는 비밀 키 , HS512 알고리즘으로 생성
	Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

	public String createToken(Authentication authentication) {
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		Date now = new Date();
		// 현재 시간에서 1시간을 더해서 토큰의 만료 시간을 설정
		// JWT가 발급되고 나서 1시간 동안만 사용할 수 있도록 제한한 시간대이다.
		Date expiryDate = new Date(now.getTime() + 3600000);
		return Jwts.builder().setSubject(userDetails.getUsername()).setIssuedAt(new Date()) // 현재 시간을 가져와서 토큰발급시간으로 설정
				.setExpiration(expiryDate) // 토큰 만료 시간 설정
				.signWith(key, SignatureAlgorithm.HS512) // 토큰 서명 추가
				.compact();
	}

	public String resolveToken(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");
		System.out.println("bearerToken 값 : " + bearerToken);
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}
		return null;
	}

	public boolean validateToken(String token) {
		try {
			// Jwts.parser().setSigningKey(key).parseClaimsJws(token); 라인을 사용하여 토큰의 유효성을 검사
			Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
			// 토큰값이 유효 하면 true
			return true;
		} catch (MalformedJwtException e) { // 토큰의 형식이 올바르지 않을 때 발생
			log.error("JWT 토큰의 형식이 올바르지 않음");
		} catch (ExpiredJwtException e) {
			log.error("JWT 토큰만료 됨");
		} catch (UnsupportedJwtException e) {
			log.error("JWT 지원되지 않는 토큰 유형");
		} catch (IllegalArgumentException e) {
			log.error("JWT 토큰이 비어있거나 null");
		} catch (SignatureException e) {
			log.error("JWT 토큰의 서명이 유효하지 않을때 발생");
		}
		// 토큰이 유효하지 않음
		return false;

	}
	// 클라이언트로 부터 전달 받은 JWT을 파싱하고, 토큰의 내용을 추출하기 위한 메서드
	public String getUsername(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(key) // 토큰을 검증할 때 사용할 비밀 키를 설정한다
				.build()
				.parseClaimsJws(token) // 전달받은 JWT 토큰을 파싱하여 서명을 검증하고, 토큰의 본문을 반환한다.
				.getBody() // 파싱된 토큰에서 Subject 필드(사용자 이름)을 추출한다.
				.getSubject();
		// JWT의 Subject(토큰의 소유자 정보)를 추출하여 반환한다.
	}
}