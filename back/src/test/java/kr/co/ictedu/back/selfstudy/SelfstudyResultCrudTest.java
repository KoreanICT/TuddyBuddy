package kr.co.ictedu.back.selfstudy;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;

@SpringBootTest
@Transactional
class SelfstudyResultCrudTest extends SelfstudyCrudFixtures {
    @Test
    void createReadAndDeleteResultsBySession() {
        long memberId = member();
        long otherMemberId = member();
        long subjectId = subject(category());
        long sessionId = session(memberId, subjectId);
        long otherResultId = result(session(otherMemberId, subjectId), otherMemberId);
        SelfStudyResultVO result = new SelfStudyResultVO();
        result.setQuiz_session_id(sessionId);
        result.setMember_num(memberId);
        result.setSelfstudy_total_score(80);
        assertEquals(1, dao.insertSelfStudyResult(result));
        assertNotNull(result.getSelfstudy_results_id());
        SelfStudyResultVO saved = dao.selectResult(result.getSelfstudy_results_id());
        assertEquals(80, saved.getSelfstudy_total_score());
        assertEquals(memberId, saved.getMember_num());
        assertEquals(sessionId, saved.getQuiz_session_id());
        assertEquals(1, dao.selectResults(memberId).size());
        assertEquals(1, dao.deleteResultsBySession(sessionId));
        assertNull(dao.selectResult(result.getSelfstudy_results_id()));
        assertTrue(dao.selectResults(memberId).isEmpty());
        assertNotNull(dao.selectResult(otherResultId));
        // Submitted results have no implemented UPDATE operation.
    }
}
