package kr.co.ictedu.back.report;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.report.dao.ReportReplyDao;
import kr.co.ictedu.back.report.dao.ReportDao;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.report.vo.ReportReplyVO;
import kr.co.ictedu.back.support.CoreCrudFixtures;

@SpringBootTest
@Transactional
class ReportReplyCrudTest {
    @Autowired ReportReplyDao dao;
    @Autowired MemberDAO members;
    @Autowired ReportDao reports;

    @Test
    void createReadUpdateAndDelete() {
        Long member = CoreCrudFixtures.member(members, "MEMBER");
        Long admin = CoreCrudFixtures.member(members, "ADMIN");
        Long report = CoreCrudFixtures.report(reports, member);
        ReportReplyVO input = new ReportReplyVO();
        input.setReport_num(report);
        input.setAdmin_num(admin);
        input.setContent("synthetic reply");
        dao.add(input);
        Long id = dao.detail(report).getNum();
        assertEquals(1, dao.countByReport(report));
        assertEquals(id, dao.detail(report).getNum());
        assertEquals(admin, dao.findByNum(id).getAdmin_num());
        assertEquals(report, dao.findByNum(id).getReport_num());
        assertEquals("synthetic reply", dao.findByNum(id).getContent());
        assertEquals(id, dao.list(member).getFirst().getNum());

        input.setNum(id);
        input.setContent("updated reply");
        assertEquals(1, dao.update(input));
        assertEquals("updated reply", dao.findByNum(id).getContent());
        assertEquals(1, dao.del(id));
        assertNull(dao.findByNum(id));
        assertEquals(0, dao.countByReport(report));

        dao.add(input);
        assertEquals(1, dao.deleteByReport(report));
        assertNull(dao.detail(report));
        assertTrue(dao.list(member).isEmpty());
    }
}
