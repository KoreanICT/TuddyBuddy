// 최원철
package kr.co.ictedu.back.member.vo;

import java.sql.Timestamp;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginLogVO {
    private Long log_num;
    private Long member_num;
    private String login_email;
    private String login_ip;
    private String login_user_agent;
    private String status;
    private Timestamp login_stime;
    private Timestamp login_etime;
}
