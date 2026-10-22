package kr.co.ictedu.back.group;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import kr.co.ictedu.back.group.dao.DocumentDao;
import kr.co.ictedu.back.group.vo.DocumentVO;

class GroupDocumentCrudTest extends GroupCrudFixtures {
    @Autowired private DocumentDao documents;

    @Test
    void createsReadsPatchesCountsHitAndDeletesMetadataWithoutFileIo() {
        Long group = group();
        Long member = member();
        membership(group, member, 1);
        DocumentVO document = new DocumentVO();
        document.setGroup_num(group);
        document.setMember_num(member);
        document.setDocument_title("fixture document");
        document.setOriginal_name("fixture.txt");
        document.setStored_name(unique() + ".txt");
        document.setDocument_path("/fixture/metadata-only");
        document.setDocument_type("text/plain");
        document.setDocument_size(12L);
        document.setHit(0L);
        documents.addDocument(document);
        Long id = documents.getDocuments(document).stream()
            .filter(row -> document.getStored_name().equals(row.getStored_name()))
            .findFirst().orElseThrow().getDocument_num();

        assertEquals("fixture document", documents.getDocumentById(id).getDocument_title());
        assertEquals(1, documents.getDocuments(document).size());
        assertEquals("fixture.txt", documents.getPatchDocument(id).getOriginal_name());
        documents.increaseHit(id);
        assertEquals(1L, documents.getDocumentById(id).getHit());

        DocumentVO patch = new DocumentVO();
        patch.setDocument_title("changed title");
        documents.patchDocument(id, patch);
        assertEquals("changed title", documents.getDocumentById(id).getDocument_title());
        assertEquals("fixture.txt", documents.getDocumentById(id).getOriginal_name());
        patch.setDocument_path("/fixture/replaced-metadata");
        patch.setOriginal_name("replacement.pdf");
        patch.setStored_name("replacement.pdf");
        patch.setDocument_type("application/pdf");
        patch.setDocument_size(24L);
        documents.patchDocument(id, patch);
        DocumentVO updated = documents.getDocumentById(id);
        assertEquals("replacement.pdf", updated.getOriginal_name());
        assertEquals("/fixture/replaced-metadata", updated.getDocument_path());
        assertEquals("application/pdf", updated.getDocument_type());
        assertEquals(24L, updated.getDocument_size());
        assertNotNull(documents.getDocuments(document).stream()
            .filter(row -> id.equals(row.getDocument_num())).findFirst().orElseThrow().getUpdated_at());

        documents.deleteDocument(id);
        assertNull(documents.getDocumentById(id));
        assertTrue(documents.getDocuments(document).isEmpty());
    }
}
