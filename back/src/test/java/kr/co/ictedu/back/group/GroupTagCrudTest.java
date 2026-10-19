package kr.co.ictedu.back.group;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

/** Join-table create/read/delete operations; no production update operation exists. */
class GroupTagCrudTest extends GroupCrudFixtures {
    @Test
    void addsViaBothDaosReadsAndDeletesGroupTags() {
        Long group = group();
        Long first = tag();
        Long second = tag();
        groups.addGroupTag(group, first);
        details.addGroupTag(group, second);
        assertEquals(2, details.getDetailTags(group).size());
        assertTrue(details.getDetailTags(group).stream().anyMatch(t -> first.equals(t.getTag_num())));
        assertTrue(details.getDetailTags(group).stream().anyMatch(t -> second.equals(t.getTag_num())));
        details.deleteGroupTags(group);
        assertTrue(details.getDetailTags(group).isEmpty());
        assertNotNull(details.getDetail(group));
    }
}
