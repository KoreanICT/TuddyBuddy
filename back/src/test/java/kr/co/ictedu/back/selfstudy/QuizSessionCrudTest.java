package kr.co.ictedu.back.selfstudy;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;

@SpringBootTest
@Transactional
class QuizSessionCrudTest extends SelfstudyCrudFixtures {
    @Test
    void createReadListAndDeleteSession() {
        long memberId = member();
        long otherMemberId = member();
        QuizSessionVO session = new QuizSessionVO();
        session.setSubject_id(subject(category()));
        session.setMember_num(memberId);
        session.setQuiz_image_url("/fixture.png");
        session.setQuiz_type("MULTIPLE_CHOICE");
        session.setQuiz_difficulty("EASY");
        session.setQuiz_count(1);
        session.setQuiz_prompt("fixture prompt");
        assertEquals(1, dao.insertQuizSession(session));
        assertNotNull(session.getQuiz_session_id());
        QuizSessionVO saved = dao.selectQuizSession(session.getQuiz_session_id());
        assertEquals(memberId, saved.getMember_num());
        assertEquals(session.getSubject_id(), saved.getSubject_id());
        assertEquals("fixture prompt", saved.getQuiz_prompt());
        assertEquals(1, dao.selectQuizSessions(memberId).size());
        assertTrue(dao.selectQuizSessions(otherMemberId).isEmpty());
        assertEquals(1, dao.deleteQuizSession(session.getQuiz_session_id()));
        assertNull(dao.selectQuizSession(session.getQuiz_session_id()));
        assertTrue(dao.selectQuizSessions(memberId).isEmpty());
        // No session UPDATE operation exists in the DAO.
    }
}
