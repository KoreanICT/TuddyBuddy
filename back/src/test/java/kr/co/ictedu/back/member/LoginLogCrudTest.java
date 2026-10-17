package kr.co.ictedu.back.member;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@Disabled("login_log exists in the supplied DDL, but production has no login_log DAO, mapper, or persistence service; CRUD cannot exercise an implemented operation.")
class LoginLogCrudTest {
    @Test
    void persistenceNotImplemented() {
        // Enable after production implements login_log persistence; do not invent test-only CRUD.
    }
}
