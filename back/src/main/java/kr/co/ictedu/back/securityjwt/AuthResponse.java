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

	// 사용자 인증 후 생성된 접근 토큰을 저장
	private String accessToken;
}
