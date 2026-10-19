package kr.co.ictedu.back.report;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.report.dao.ReportDao;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.report.vo.ReportVO;
import kr.co.ictedu.back.support.CoreCrudFixtures;

@SpringBootTest
@Transactional
class ReportCrudTest {
    @Autowired ReportDao dao;
    @Autowired MemberDAO members;

    @Test
    void createReadUpdateStatusAndDelete() {
        Long member = CoreCrudFixtures.member(members, "MEMBER");
        String marker = CoreCrudFixtures.marker();
        ReportVO input = new ReportVO();
        input.setMember_num(member);
        input.setType("report");
        input.setTarget_num(0L);
        input.setCategory(marker);
        input.setContent("synthetic content");
        dao.add(input);
        Map<String, String> page = Map.of("member_num", member.toString(), "begin", "1", "end", "10");
        Long id = dao.myList(page).stream().filter(row -> marker.equals(row.getCategory()))
                .findFirst().orElseThrow().getNum();

        ReportVO stored = dao.detail(id);
        assertEquals(member, stored.getMember_num());
        assertEquals("report", stored.getType());
        assertEquals(0L, stored.getTarget_num());
        assertEquals("PENDING", stored.getStatus());
        assertEquals("synthetic content", stored.getContent());
        assertEquals(1, dao.myTotalCount(page));
        assertEquals(id, dao.myList(page).getFirst().getNum());
        assertEquals(id, dao.lockDetail(id).getNum());

        input.setNum(id);
        input.setCategory("updated reason");
        input.setContent("updated content");
        assertEquals(1, dao.update(input));
        assertEquals("updated reason", dao.detail(id).getCategory());
        assertEquals("updated content", dao.detail(id).getContent());
        input.setStatus("REVIEWING");
        assertEquals(1, dao.updateStatus(input));
        assertEquals("REVIEWING", dao.detail(id).getStatus());
        assertEquals(1, dao.del(id));
        assertNull(dao.detail(id));
        assertEquals(0, dao.myTotalCount(page));
    }
}
