package kr.co.ictedu.back.notification;

import static org.junit.jupiter.api.Assertions.fail;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("NotificationService currently sends in-memory SSE events only; no notification table DAO or mapper exists.")
class NotificationCrudTest {
    @Test
    void awaitingImplementedPersistence() {
        fail("Enable only after actual persistence for this table is implemented.");
    }
}
