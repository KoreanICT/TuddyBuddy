package kr.co.ictedu.back.timer;

import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.timer.vo.TimerVO;

@SpringBootTest
@Transactional
class TimerCrudTest extends TimerCrudFixtures {
    @Test
    void createAndReadIntervalsInChronologicalOrderWithoutCrossingSessions() {
        long memberId = member();
        long sessionId = session(memberId);
        long otherSessionId = session(memberId);
        LocalDateTime start = LocalDateTime.of(2026, 1, 1, 10, 0);
        assertEquals(1, dao.insertInterval(interval(sessionId, start.plusMinutes(2), start.plusMinutes(3))));
        assertEquals(1, dao.insertInterval(interval(sessionId, start, start.plusMinutes(1))));
        var intervals = dao.selectIntervals(sessionId);
        assertEquals(2, intervals.size());
        assertNotNull(intervals.get(0).getTimers_id());
        assertEquals(start, intervals.get(0).getStarted_at());
        assertEquals(start.plusMinutes(1), intervals.get(0).getEnded_at());
        assertEquals(start.plusMinutes(2), intervals.get(1).getStarted_at());
        assertEquals(sessionId, intervals.get(0).getTimer_id());
        assertTrue(dao.selectIntervals(otherSessionId).isEmpty());
        var recent = dao.selectRecent(memberId);
        assertEquals(1, recent.size());
        assertEquals(sessionId, recent.get(0).getTimer_session_id());
        // Interval UPDATE/DELETE operations do not exist in TimerDao.
    }

    private TimerVO interval(long sessionId, LocalDateTime start, LocalDateTime end) {
        TimerVO interval = new TimerVO();
        interval.setTimer_id(sessionId);
        interval.setStarted_at(start);
        interval.setEnded_at(end);
        return interval;
    }
}
