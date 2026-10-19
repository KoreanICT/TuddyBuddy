package kr.co.ictedu.back.group;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import kr.co.ictedu.back.group.dao.TagDao;
import kr.co.ictedu.back.group.vo.TagVO;

/** studytag has create/read operations only; no production update/delete mapper exists. */
class StudytagCrudTest extends GroupCrudFixtures {
    @Autowired private TagDao tags;

    @Test
    void tagDaoSearchFindsPersistedStudytag() {
        // Deliberately exposes the current mapper's FROM tag / schema studytag mismatch.
        TagVO tag = new TagVO();
        tag.setTag_name(unique());
        tag.setTag_color("#123456");
        groups.addTag(tag);
        assertTrue(tags.searchTags(tag.getTag_name()).stream()
            .anyMatch(t -> tag.getTag_num().equals(t.getTag_num())));
    }

    @Test
    void groupDaoCreatesAndFindsTagCaseInsensitively() {
        TagVO tag = new TagVO();
        tag.setTag_name("fixture" + unique());
        tag.setTag_color("#123456");
        groups.addTag(tag);
        assertNotNull(tag.getTag_num());
        assertEquals(tag.getTag_num(), groups.findTagByName(tag.getTag_name().toUpperCase()).getTag_num());
        assertTrue(groups.searchTags(tag.getTag_name()).stream()
            .anyMatch(t -> tag.getTag_num().equals(t.getTag_num())));
        assertEquals("#123456", groups.findTagByName(tag.getTag_name()).getTag_color());
    }

    @Test
    void detailDaoCreatesAndReadsTag() {
        TagVO tag = new TagVO();
        tag.setTag_name("detail" + unique());
        tag.setTag_color("#abcdef");
        details.addTag(tag);
        assertEquals(tag.getTag_num(), details.findTagByName(tag.getTag_name()).getTag_num());
    }
}
