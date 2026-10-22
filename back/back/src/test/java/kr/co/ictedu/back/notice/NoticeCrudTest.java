package kr.co.ictedu.back.notice;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.notice.dao.NoticeDao;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.notice.vo.NoticeVO;
import kr.co.ictedu.back.support.CoreCrudFixtures;

@SpringBootTest
@Transactional
class NoticeCrudTest {
    @Autowired NoticeDao dao;
    @Autowired MemberDAO members;

    @Test
    void createReadHitUpdateAndDelete() {
        Long author = CoreCrudFixtures.member(members, "ADMIN");
        String title = "crud-" + CoreCrudFixtures.marker();
        NoticeVO input = new NoticeVO();
        input.setMember_num(author);
        input.setTitle(title);
        input.setContent("synthetic notice");
        input.setImgn("fixture.png");
        dao.add(input);
        Map<String, String> page = Map.of("searchType", "1", "searchValue", title, "begin", "1", "end", "10");
        Long id = dao.list(page).stream().filter(row -> author.equals(row.getMember_num())
                && title.equals(row.getTitle())).findFirst().orElseThrow().getNum();
        assertEquals(author, dao.detail(id).getMember_num());
        assertEquals(title, dao.detail(id).getTitle());
        assertEquals("synthetic notice", dao.detail(id).getContent());
        assertEquals("fixture.png", dao.detail(id).getImgn());
        assertEquals(0, dao.detail(id).getHit());
        assertEquals(1, dao.totalCount(page));
        assertEquals(id, dao.list(page).getFirst().getNum());
        dao.hit(id);
        assertEquals(1, dao.detail(id).getHit());

        input.setNum(id);
        input.setTitle("updated " + title);
        input.setContent("updated notice");
        input.setImgn("updated.png");
        assertEquals(1, dao.update(input));
        NoticeVO updated = dao.detail(id);
        assertEquals("updated " + title, updated.getTitle());
        assertEquals("updated notice", updated.getContent());
        assertEquals("updated.png", updated.getImgn());
        assertEquals(1, updated.getHit());
        dao.del(id);
        assertNull(dao.detail(id));
        assertEquals(0, dao.totalCount(page));
    }
}
