//작성자 : 오진석
package kr.co.ictedu.back.group.dto;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("groupinviterequest")
@Getter
@Setter
public class GroupInviteRequest {
	
	private String inviteCode;
}
