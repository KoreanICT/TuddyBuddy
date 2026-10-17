package kr.co.ictedu.back.selfstudy;

import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.support.CoreCrudFixtures;
import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.dao.SelfStudyAdminDao;
import kr.co.ictedu.back.selfstudy.vo.*;

/** Every fixture belongs to the enclosing test transaction; no existing rows are reused. */
abstract class SelfstudyCrudFixtures {
    @Autowired protected MemberDAO members;
    @Autowired protected SelfStudyDao dao;
    @Autowired protected SelfStudyAdminDao admin;

    protected String marker() { return "crud-" + CoreCrudFixtures.marker(); }

    protected long member() {
        return CoreCrudFixtures.member(members, "MEMBER");
    }

    protected long category() {
        CategoryVO category = new CategoryVO();
        category.setCategory_name(marker());
        assertEquals(1, admin.insertCategory(category));
        return admin.selectAllCategories().stream()
                .filter(row -> category.getCategory_name().equals(row.getCategory_name()))
                .findFirst().orElseThrow().getCategory_id();
    }

    protected long subject(long categoryId) {
        SubjectVO subject = new SubjectVO();
        subject.setCategory_id(categoryId);
        subject.setSubject_name(marker());
        assertEquals(1, admin.insertSubject(subject));
        return admin.selectAllSubjects().stream()
                .filter(row -> subject.getSubject_name().equals(row.getSubject_name()))
                .findFirst().orElseThrow().getSubject_id();
    }

    protected long session(long memberId, long subjectId) {
        QuizSessionVO session = new QuizSessionVO();
        session.setSubject_id(subjectId);
        session.setMember_num(memberId);
        session.setQuiz_image_url("/fixture.png");
        session.setQuiz_type("MULTIPLE_CHOICE");
        session.setQuiz_difficulty("EASY");
        session.setQuiz_count(1);
        session.setQuiz_prompt("fixture prompt");
        assertEquals(1, dao.insertQuizSession(session));
        assertNotNull(session.getQuiz_session_id());
        return session.getQuiz_session_id();
    }

    protected long quiz(long sessionId) {
        QuizVO quiz = new QuizVO();
        quiz.setQuiz_session_id(sessionId);
        quiz.setQuiz_question("fixture question");
        quiz.setQuiz_selections("[\"A\",\"B\"]");
        quiz.setQuiz_correct_answer("A");
        quiz.setQuiz_explanation("fixture explanation");
        assertEquals(1, dao.insertQuiz(quiz));
        assertNotNull(quiz.getQuiz_id());
        return quiz.getQuiz_id();
    }

    protected long result(long sessionId, long memberId) {
        SelfStudyResultVO result = new SelfStudyResultVO();
        result.setQuiz_session_id(sessionId);
        result.setMember_num(memberId);
        result.setSelfstudy_total_score(100);
        assertEquals(1, dao.insertSelfStudyResult(result));
        assertNotNull(result.getSelfstudy_results_id());
        return result.getSelfstudy_results_id();
    }
}
