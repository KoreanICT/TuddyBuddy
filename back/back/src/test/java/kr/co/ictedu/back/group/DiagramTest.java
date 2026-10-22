package kr.co.ictedu.back.group;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.group.dao.DiagramDao;
import kr.co.ictedu.back.group.service.DiagramService;
import kr.co.ictedu.back.group.vo.DiagramVO;

@SpringBootTest
@Transactional
public class DiagramTest {

    @Autowired
    private DiagramService diagramService;

    // DB에 존재하며 다이어그램이 없는 테스트 전용 그룹 번호
    private final Long groupNum = 1L;

//    @Test
//    void diagramCrudTest() {
//        // 등록 (MERGE INSERT)
//        assertNull(diagramService.getDiagram(groupNum));
//
//        DiagramVO vo = new DiagramVO();
//        vo.setGroup_num(groupNum);
//        vo.setTitle("JUnit 등록 테스트");
//        vo.setDiagram_data("{\"nodes\":[],\"edges\":[]}");
//
//        diagramService.addDiagram(vo);
//
//        DiagramVO detail = diagramService.getDiagram(groupNum);
//        assertNotNull(detail);
//        assertEquals("JUnit 등록 테스트", detail.getTitle());
//
//        // 수정 (PUT)
//        vo.setTitle("JUnit 수정 테스트");
//        vo.setDiagram_data("{\"nodes\":[{\"id\":\"1\"}],\"edges\":[]}");
//        diagramService.putDiagram(vo);
//
//        detail = diagramService.getDiagram(groupNum);
//        assertEquals("JUnit 수정 테스트", detail.getTitle());
//
//        // MERGE UPDATE
//        vo.setTitle("JUnit MERGE 테스트");
//        diagramService.addDiagram(vo);
//
//        detail = diagramService.getDiagram(groupNum);
//        assertEquals("JUnit MERGE 테스트", detail.getTitle());
//
//        // 삭제
//        diagramService.delDiagram(groupNum);
//        assertNull(diagramService.getDiagram(groupNum));
//
//        System.out.println("Diagram CRUD 검수 완료");
//    }
}