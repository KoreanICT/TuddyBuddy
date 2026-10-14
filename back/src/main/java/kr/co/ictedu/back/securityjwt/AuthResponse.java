package kr.co.ictedu.back.securityjwt;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AuthResponse {

	// JWT 토큰
	private String accessToken;
	
	// 회원번호
	private Long member_num;
	
	// 회원권한
	private String authority;
}
