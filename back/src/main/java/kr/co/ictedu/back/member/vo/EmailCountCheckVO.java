// 최원철
package kr.co.ictedu.back.member.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmailCountCheckVO {
	private boolean success;
	private String reason;
	private String verificationToken;

	public EmailCountCheckVO(boolean success, String reason) {
		this(success, reason, null);
	}
}
