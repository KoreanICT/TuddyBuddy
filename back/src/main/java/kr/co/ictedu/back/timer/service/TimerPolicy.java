package kr.co.ictedu.back.timer.service;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import kr.co.ictedu.back.timer.dto.TimerDto;
import kr.co.ictedu.back.timer.vo.TimerVO;

public final class TimerPolicy {
    private TimerPolicy() {}
    public static int minutes(Integer value) {
        if (value == null || value < 1 || value > 240)
            throw new IllegalArgumentException("목표 시간은 1~240분이어야 합니다.");
        return value;
    }
    public static List<TimerVO> normalize(TimerDto.Save request, Long sessionId) {
        if (request == null || request.intervals() == null || request.intervals().isEmpty() || request.intervals().size() > 500)
            throw new IllegalArgumentException("공부 구간은 1~500개여야 합니다.");
        return request.intervals().stream().map(i -> {
            if (i == null || i.startedAt() == null || i.endedAt() == null)
                throw new IllegalArgumentException("공부 시작/종료 시각이 필요합니다.");
            var t = new TimerVO();
            t.setTimer_id(sessionId);
            // 브라우저가 보내는 밀리초 정밀도에 맞춰 정규화. DB TIMESTAMP는 UTC.
            t.setStarted_at(LocalDateTime.ofInstant(i.startedAt().toInstant().truncatedTo(java.time.temporal.ChronoUnit.MILLIS), ZoneOffset.UTC));
            t.setEnded_at(LocalDateTime.ofInstant(i.endedAt().toInstant().truncatedTo(java.time.temporal.ChronoUnit.MILLIS), ZoneOffset.UTC));
            return t;
        }).toList();
    }
    public static long seconds(List<TimerVO> intervals, int minutes, Instant now) {
        long totalMs = 0;
        LocalDateTime previousEnd = null;
        for (var t : intervals) {
            var start = t.getStarted_at(); var end = t.getEnded_at();
            var span = Duration.between(start, end);
            if (span.isNegative() || span.isZero() || span.compareTo(Duration.ofMinutes(minutes)) > 0)
                throw new IllegalArgumentException("공부 구간은 0보다 크고 목표 시간 이하여야 합니다.");
            long duration = span.toMillis();
            if (duration <= 0 || (previousEnd != null && start.isBefore(previousEnd)))
                throw new IllegalArgumentException("구간이 겹치거나 시작/종료 순서가 올바르지 않습니다.");
            if (start.toInstant(ZoneOffset.UTC).isBefore(now.minus(Duration.ofDays(7))) || end.toInstant(ZoneOffset.UTC).isAfter(now.plusSeconds(300)))
                throw new IllegalArgumentException("시각을 확인해주세요. 최근 7일 기록만 저장할 수 있습니다.");
            totalMs += duration;
            previousEnd = end;
        }
        if (totalMs > minutes * 60_000L)
            throw new IllegalArgumentException("실제 공부 시간이 설정한 목표 시간을 초과합니다.");
        return totalMs / 1000; // 구간별로 버리지 않고 합산한 후 초로 변환
    }
    public static boolean same(List<TimerVO> saved, List<TimerVO> requested) {
        if (saved.size() != requested.size()) return false;
        for (int i=0; i<saved.size(); i++) {
            if (!saved.get(i).getStarted_at().equals(requested.get(i).getStarted_at()) ||
                !saved.get(i).getEnded_at().equals(requested.get(i).getEnded_at())) return false;
        }
        return true;
    }
}
