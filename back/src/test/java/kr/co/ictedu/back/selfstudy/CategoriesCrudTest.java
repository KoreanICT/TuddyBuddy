package kr.co.ictedu.back.selfstudy;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;

@SpringBootTest
@Transactional
class CategoriesCrudTest extends SelfstudyCrudFixtures {
    @Test
    void createReadRenameAndDeactivateCategory() {
        CategoryVO category = new CategoryVO();
        category.setCategory_name(marker());
        assertEquals(1, admin.insertCategory(category));
        CategoryVO saved = admin.selectAllCategories().stream()
                .filter(row -> category.getCategory_name().equals(row.getCategory_name())).findFirst().orElseThrow();
        assertEquals("Y", saved.getCategory_status());
        assertTrue(dao.selectCategories().stream().anyMatch(row -> saved.getCategory_id().equals(row.getCategory_id())));

        saved.setCategory_name(marker());
        assertEquals(1, admin.updateCategoryName(saved));
        assertEquals(saved.getCategory_name(), admin.selectAllCategories().stream()
                .filter(row -> saved.getCategory_id().equals(row.getCategory_id()))
                .findFirst().orElseThrow().getCategory_name());
        assertEquals(1, admin.updateCategoryStatus(saved.getCategory_id(), "N"));
        assertFalse(dao.selectCategories().stream().anyMatch(row -> saved.getCategory_id().equals(row.getCategory_id())));
        assertEquals("N", admin.selectAllCategories().stream()
                .filter(row -> saved.getCategory_id().equals(row.getCategory_id())).findFirst().orElseThrow().getCategory_status());
        // Physical DELETE is not implemented by this DAO; deactivation is the supported removal operation.
    }
}
