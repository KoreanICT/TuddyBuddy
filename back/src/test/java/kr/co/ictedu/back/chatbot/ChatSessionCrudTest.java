package kr.co.ictedu.back.chatbot;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import kr.co.ictedu.back.member.dao.MemberDAO;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.chatbot.dao.ChatSessionDAO;
import kr.co.ictedu.back.chatbot.vo.ChatSessionVO;
import kr.co.ictedu.back.support.DbCrudFixtures;

@SpringBootTest
@Transactional
class ChatSessionCrudTest {
    @Autowired ChatSessionDAO sessions;
    @Autowired MemberDAO members;

    // Implemented: create, detail, member list. No update/delete persistence API.
    @Test
    void createsSessionAndScopesListToItsMember() {
        long member = DbCrudFixtures.member(members);
        long other = DbCrudFixtures.member(members);
        ChatSessionVO session = new ChatSessionVO();
        session.setMember_num(member);
        sessions.add(session);
        assertTrue(session.getChat_num() > 0);
        ChatSessionVO stored = sessions.detail(session.getChat_num());
        assertNotNull(stored);
        assertEquals(Long.valueOf(member), stored.getMember_num());
        assertNotNull(stored.getChat_regdate());
        assertEquals(1, sessions.list(member).size());
        assertTrue(sessions.list(other).isEmpty());
    }

    @Test
    void guestSessionStoresNullMember() {
        ChatSessionVO guest = new ChatSessionVO();
        sessions.add(guest);
        assertNull(sessions.detail(guest.getChat_num()).getMember_num());
    }
}
