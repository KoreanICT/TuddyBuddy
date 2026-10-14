//최솔
package kr.co.ictedu.back.timer.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.List;

@Schema(description = "TimerDto 데이터")
public final class TimerDto {
    private TimerDto() {}
    @Schema(description = "Create 데이터")
    public record Create(@Schema(description = "설정한 타이머 시간(분)", example = "30") Integer setTimeMinutes) {}
    @Schema(description = "Interval 데이터")
    public record Interval(@Schema(description = "타이머 시작 일시", example = "2026-10-14T10:00:00+09:00") OffsetDateTime startedAt, @Schema(description = "타이머 종료 일시", example = "2026-10-14T10:30:00+09:00") OffsetDateTime endedAt) {}
    @Schema(description = "Save 데이터")
    public record Save(@Schema(description = "학습 시간 구간 목록") List<Interval> intervals) {}
    @Schema(description = "Session 데이터")
    public record Session(@Schema(description = "타이머 세션 번호", example = "1") Long timerSessionId, @Schema(description = "설정한 타이머 시간(분)", example = "30") int setTimeMinutes, @Schema(description = "누적 학습 시간(초)", example = "1800") long totalTimeSeconds) {}
    @Schema(description = "Summary 데이터")
    public record Summary(@Schema(description = "누적 학습 시간(초)", example = "1800") long totalTimeSeconds, @Schema(description = "타이머 세션 목록") List<Session> sessions) {}
}

