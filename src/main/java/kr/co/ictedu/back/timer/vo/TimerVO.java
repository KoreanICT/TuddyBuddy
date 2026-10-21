//최솔
package kr.co.ictedu.back.timer.vo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.apache.ibatis.type.Alias;
@Getter
@Setter
@Alias("timerVO")
@Schema(description = "TimerVO 데이터")
public class TimerVO {
    @Schema(description = "타이머 기록 번호", example = "1")
    private Long timers_id;
    @Schema(description = "타이머 시작 일시", example = "2026-10-14T10:00:00")
    private LocalDateTime started_at;
    @Schema(description = "타이머 종료 일시", example = "2026-10-14T10:30:00")
    private LocalDateTime ended_at;
    @Schema(description = "타이머 세션 번호", example = "1")
    private Long timer_id;
}
