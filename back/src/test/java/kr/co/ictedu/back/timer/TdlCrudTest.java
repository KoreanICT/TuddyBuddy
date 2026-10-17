package kr.co.ictedu.back.timer;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@Disabled("tdl exists in the supplied DDL, but no backend DAO, mapper, or persistence service implements its CRUD operations")
class TdlCrudTest {
    @Test
    void persistenceIsNotImplemented() {
        // Do not invent production CRUD or count direct fixture SQL as DAO coverage.
    }
}
