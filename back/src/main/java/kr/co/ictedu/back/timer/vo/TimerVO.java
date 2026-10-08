package kr.co.ictedu.back.timer.vo;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.apache.ibatis.type.Alias;
@Getter
@Setter
@Alias("timerVO")
public class TimerVO {
    private Long timers_id;
    private LocalDateTime started_at;
    private LocalDateTime ended_at;
    private Long timer_id;
}
