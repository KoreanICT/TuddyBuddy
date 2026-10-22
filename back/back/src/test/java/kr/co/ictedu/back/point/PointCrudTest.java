package kr.co.ictedu.back.point;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import kr.co.ictedu.back.member.dao.MemberDAO;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.point.dao.PointDao;
import kr.co.ictedu.back.point.vo.PointVO;
import kr.co.ictedu.back.support.DbCrudFixtures;

@SpringBootTest
@Transactional
class PointCrudTest {
    @Autowired PointDao points;
    @Autowired MemberDAO members;

    // Append-only ledger: update/delete deliberately absent from PointDao.
    // Current mapper omits POINT_NUM/REGDATE; supplied DDL has no defaults.
    // This test exposes that schema/mapper mismatch instead of bypassing insertPoint.
    @Test
    void appendsLedgerEntryWithoutChangingMemberBalance() {
        long member = DbCrudFixtures.member(members);
        PointVO entry = new PointVO();
        entry.setMember_num(member);
        entry.setAmount(25L);
        entry.setBalance_before(0L);
        entry.setBalance_after(25L);
        entry.setPayment_price(0L);
        entry.setPoint_type("ADMIN");
        entry.setDescription("CRUD ledger fixture");
        points.insertPoint(entry);
        var ledger = points.select_point_log(member);
        assertEquals(1, ledger.size());
        PointVO stored = ledger.get(0);
        assertEquals(Long.valueOf(25), stored.getAmount());
        assertEquals(Long.valueOf(0), stored.getBalance_before());
        assertEquals(Long.valueOf(25), stored.getBalance_after());
        assertEquals("ADMIN", stored.getPoint_type());
        assertEquals("CRUD ledger fixture", stored.getDescription());
        assertNotNull(stored.getPoint_num());
        assertNotNull(stored.getRegdate());
        assertEquals(Long.valueOf(0), points.select_point(member));
    }
}
