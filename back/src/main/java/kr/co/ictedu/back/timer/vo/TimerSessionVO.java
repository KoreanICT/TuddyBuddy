package kr.co.ictedu.back.timer.vo;

import lombok.Getter;
import lombok.Setter;
import org.apache.ibatis.type.Alias;
@Getter
@Setter 
@Alias("timerSessionVO")
public class TimerSessionVO {
    private Long timer_session_id;
    private Integer set_time_minutes;//**********
    private Long total_time;
    private Long member_num;
}
