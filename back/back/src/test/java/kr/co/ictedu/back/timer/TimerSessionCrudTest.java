package kr.co.ictedu.back.timer;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.timer.vo.TimerSessionVO;

@SpringBootTest
@Transactional
class TimerSessionCrudTest extends TimerCrudFixtures {
    @Test
    void createReadUpdateTotalAndRestrictOwnerLookup() {
        long memberId = member();
        long otherMemberId = member();
        TimerSessionVO session = new TimerSessionVO();
        session.setMember_num(memberId);
        session.setSet_time_minutes(25);
        assertEquals(1, dao.insertSession(session));
        assertNotNull(session.getTimer_session_id());
        TimerSessionVO saved = dao.lockSession(session.getTimer_session_id(), memberId);
        assertEquals(25, saved.getSet_time_minutes());
        assertEquals(0L, saved.getTotal_time());
        assertEquals(memberId, saved.getMember_num());
        assertNull(dao.lockSession(session.getTimer_session_id(), otherMemberId));
        assertEquals(1, dao.updateTotal(session.getTimer_session_id(), 90L));
        assertEquals(90L, dao.lockSession(session.getTimer_session_id(), memberId).getTotal_time());
        assertEquals(90L, dao.selectTotal(memberId));
        assertEquals(0L, dao.selectTotal(otherMemberId));
        assertTrue(dao.selectRecent(memberId).isEmpty(), "Sessions without intervals must not be recent study history");
        // No session DELETE is implemented; transaction rollback removes this fixture.
    }
}
