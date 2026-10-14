//최솔
package kr.co.ictedu.back.timer.vo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.ibatis.type.Alias;
@Getter
@Setter 
@Alias("timerSessionVO")
@Schema(description = "TimerSessionVO 데이터")
public class TimerSessionVO {
    @Schema(description = "타이머 세션 번호", example = "1")
    private Long timer_session_id;
    @Schema(description = "설정한 타이머 시간(분)", example = "30")
    private Integer set_time_minutes;//**********
    @Schema(description = "누적 학습 시간(초)", example = "1800")
    private Long total_time;
    @Schema(description = "회원 번호", example = "1")
    private Long member_num;
}
