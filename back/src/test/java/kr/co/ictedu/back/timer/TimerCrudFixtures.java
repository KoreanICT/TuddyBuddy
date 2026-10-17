package kr.co.ictedu.back.timer;

import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.support.CoreCrudFixtures;
import kr.co.ictedu.back.timer.dao.TimerDao;
import kr.co.ictedu.back.timer.vo.TimerSessionVO;

abstract class TimerCrudFixtures {
    @Autowired protected MemberDAO members;
    @Autowired protected TimerDao dao;

    protected long member() {
        return CoreCrudFixtures.member(members, "MEMBER");
    }

    protected long session(long memberId) {
        TimerSessionVO session = new TimerSessionVO();
        session.setMember_num(memberId);
        session.setSet_time_minutes(25);
        assertEquals(1, dao.insertSession(session));
        assertNotNull(session.getTimer_session_id());
        return session.getTimer_session_id();
    }
}
