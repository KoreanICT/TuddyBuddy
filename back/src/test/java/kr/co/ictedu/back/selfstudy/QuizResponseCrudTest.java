package kr.co.ictedu.back.selfstudy;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;

@SpringBootTest
@Transactional
class QuizResponseCrudTest extends SelfstudyCrudFixtures {
    @Test
    void createReadAndDeleteResponsesBySession() {
        long memberId = member();
        long subjectId = subject(category());
        long sessionId = session(memberId, subjectId);
        long resultId = result(sessionId, memberId);
        long quizId = quiz(sessionId);
        long otherSessionId = session(memberId, subjectId);
        long otherResultId = result(otherSessionId, memberId);
        QuizResponseVO response = response(resultId, quizId);
        QuizResponseVO other = response(otherResultId, quiz(otherSessionId));
        assertEquals(1, dao.insertQuizResponse(response));
        assertEquals(1, dao.insertQuizResponse(other));
        assertNotNull(response.getQuiz_responses_id());
        assertEquals(1, dao.selectQuizResponses(resultId).size());
        QuizResponseVO saved = dao.selectQuizResponses(resultId).get(0);
        assertEquals(response.getQuiz_responses_id(), saved.getQuiz_responses_id());
        assertEquals(quizId, saved.getQuiz_id());
        assertEquals("A", saved.getQuiz_user_response());
        assertEquals("Y", saved.getQuiz_correct());
        assertEquals(1, dao.deleteQuizResponsesBySession(sessionId));
        assertTrue(dao.selectQuizResponses(resultId).isEmpty());
        assertEquals(1, dao.selectQuizResponses(otherResultId).size());
        // Submitted responses have no implemented UPDATE operation.
    }

    private QuizResponseVO response(long resultId, long quizId) {
        QuizResponseVO response = new QuizResponseVO();
        response.setSelfstudy_results_id(resultId);
        response.setQuiz_id(quizId);
        response.setQuiz_user_response("A");
        response.setQuiz_correct("Y");
        return response;
    }
}
