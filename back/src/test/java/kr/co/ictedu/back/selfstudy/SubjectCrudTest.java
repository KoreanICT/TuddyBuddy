package kr.co.ictedu.back.selfstudy;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;

@SpringBootTest
@Transactional
class SubjectCrudTest extends SelfstudyCrudFixtures {
    @Test
    void createAndReadSubject() {
        long categoryId = category();
        SubjectVO subject = new SubjectVO();
        subject.setCategory_id(categoryId);
        subject.setSubject_name(marker());
        assertEquals(1, admin.insertSubject(subject));
        SubjectVO saved = admin.selectAllSubjects().stream()
                .filter(row -> subject.getSubject_name().equals(row.getSubject_name())).findFirst().orElseThrow();
        assertEquals(subject.getSubject_name(), dao.selectSubject(saved.getSubject_id()).getSubject_name());
        assertTrue(dao.selectSubjects(categoryId).stream().anyMatch(row -> saved.getSubject_id().equals(row.getSubject_id())));
    }

    @Test
    void renameDeactivateAndRespectCategoryVisibility() {
        long categoryId = category();
        long subjectId = subject(categoryId);
        SubjectVO update = new SubjectVO();
        update.setSubject_id(subjectId);
        update.setSubject_name(marker());
        assertEquals(1, admin.updateSubjectName(update));
        assertEquals(update.getSubject_name(), dao.selectSubject(subjectId).getSubject_name());
        assertEquals(1, admin.updateSubjectStatus(subjectId, "N"));
        assertTrue(dao.selectSubjects(categoryId).isEmpty());
        assertEquals("N", admin.selectAllSubjects().stream()
                .filter(row -> row.getSubject_id().equals(subjectId)).findFirst().orElseThrow().getSubject_status());
        assertEquals(1, admin.updateSubjectStatus(subjectId, "Y"));
        assertEquals(1, admin.updateCategoryStatus(categoryId, "N"));
        assertTrue(dao.selectSubjects(categoryId).isEmpty());
        // Physical DELETE is absent; the DAO supports activation/deactivation instead.
    }
}
