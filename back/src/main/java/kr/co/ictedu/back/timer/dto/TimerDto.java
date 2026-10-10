package kr.co.ictedu.back.timer.dto;
import java.time.OffsetDateTime;
import java.util.List;
public final class TimerDto {
    private TimerDto() {}
    public record Create(Integer setTimeMinutes) {}
    public record Interval(OffsetDateTime startedAt, OffsetDateTime endedAt) {}
    public record Save(List<Interval> intervals) {}
    public record Session(Long timerSessionId, int setTimeMinutes, long totalTimeSeconds) {}
    public record Summary(long totalTimeSeconds, List<Session> sessions) {}
}
