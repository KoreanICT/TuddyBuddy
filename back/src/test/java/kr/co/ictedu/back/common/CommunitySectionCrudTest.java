package kr.co.ictedu.back.common;

import static org.junit.jupiter.api.Assertions.fail;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("communityMapper.xml uses community/community_comment, not supplied community_section; CommunityVO text fields are int. CRUD cannot target this table until mapping is implemented.")
class CommunitySectionCrudTest {
    @Test
    void awaitingImplementedPersistence() {
        fail("Enable only after actual persistence for this table is implemented.");
    }
}
