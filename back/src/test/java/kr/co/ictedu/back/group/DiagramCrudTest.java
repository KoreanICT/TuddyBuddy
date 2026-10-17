package kr.co.ictedu.back.group;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import kr.co.ictedu.back.group.dao.DiagramDao;
import kr.co.ictedu.back.group.vo.DiagramVO;

/** DiagramDao implements merge/read; no production delete operation exists. */
class DiagramCrudTest extends GroupCrudFixtures {
    @Autowired private DiagramDao diagrams;

    @Test
    void mergeInsertsThenUpdatesSameGroupWithoutDuplicateRows() {
        Long group = group();
        assertNull(diagrams.getDiagram(group));
        DiagramVO diagram = new DiagramVO();
        diagram.setGroup_num(group);
        diagram.setTitle("fixture diagram");
        diagram.setDiagram_data("{\"nodes\":[],\"edges\":[]}");
        diagrams.mergeDiagram(diagram);
        assertEquals("fixture diagram", diagrams.getDiagram(group).getTitle());
        assertEquals(diagram.getDiagram_data(), diagrams.getDiagram(group).getDiagram_data());
        assertNotNull(diagrams.getDiagram(group).getCreated_at());

        diagram.setTitle("changed diagram");
        diagram.setDiagram_data("{\"nodes\":[{\"id\":\"1\"}],\"edges\":[]}");
        diagrams.mergeDiagram(diagram);
        assertEquals("changed diagram", diagrams.getDiagram(group).getTitle());
        assertEquals(diagram.getDiagram_data(), diagrams.getDiagram(group).getDiagram_data());
        assertNotNull(diagrams.getDiagram(group).getUpdated_at());
    }
}
