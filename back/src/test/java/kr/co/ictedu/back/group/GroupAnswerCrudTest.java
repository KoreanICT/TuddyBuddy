package kr.co.ictedu.back.group;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("group_answer exists in the supplied schema, but back/src/main has no DAO, mapper, or service persistence operations for it")
class GroupAnswerCrudTest {
    @Test
    void persistenceNotImplemented() { }
}
