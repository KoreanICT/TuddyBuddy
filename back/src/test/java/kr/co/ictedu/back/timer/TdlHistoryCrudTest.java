package kr.co.ictedu.back.timer;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@Disabled("tdl_history exists in the supplied DDL, but no backend DAO, mapper, or persistence service implements its CRUD operations")
class TdlHistoryCrudTest {
    @Test
    void persistenceIsNotImplemented() {
        // Keep this explicit until real application persistence exists.
    }
}
