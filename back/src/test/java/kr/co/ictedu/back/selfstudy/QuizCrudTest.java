package kr.co.ictedu.back.selfstudy;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;

@SpringBootTest
@Transactional
class QuizCrudTest extends SelfstudyCrudFixtures {
    @Test
    void createReadAndDeleteOnlySelectedSessionsQuizzes() {
        long memberId = member();
        long subjectId = subject(category());
        long sessionId = session(memberId, subjectId);
        long otherSessionId = session(memberId, subjectId);
        long otherQuizId = quiz(otherSessionId);
        QuizVO quiz = new QuizVO();
        quiz.setQuiz_session_id(sessionId);
        quiz.setQuiz_question("fixture question");
        quiz.setQuiz_selections("[\"A\",\"B\"]");
        quiz.setQuiz_correct_answer("A");
        quiz.setQuiz_explanation("fixture explanation");
        assertEquals(1, dao.insertQuiz(quiz));
        assertNotNull(quiz.getQuiz_id());
        QuizVO saved = dao.selectQuiz(quiz.getQuiz_id());
        assertEquals(quiz.getQuiz_question(), saved.getQuiz_question());
        assertEquals(quiz.getQuiz_selections(), saved.getQuiz_selections());
        assertEquals("A", saved.getQuiz_correct_answer());
        assertEquals(quiz.getQuiz_explanation(), saved.getQuiz_explanation());
        assertEquals(1, dao.selectQuizzes(sessionId).size());
        assertEquals(1, dao.deleteQuizzesBySession(sessionId));
        assertNull(dao.selectQuiz(quiz.getQuiz_id()));
        assertTrue(dao.selectQuizzes(sessionId).isEmpty());
        assertNotNull(dao.selectQuiz(otherQuizId));
        // Quizzes have no implemented UPDATE operation.
    }
}
