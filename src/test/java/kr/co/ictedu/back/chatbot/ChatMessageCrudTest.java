package kr.co.ictedu.back.chatbot;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import kr.co.ictedu.back.member.dao.MemberDAO;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.chatbot.dao.ChatMessageDAO;
import kr.co.ictedu.back.chatbot.dao.ChatSessionDAO;
import kr.co.ictedu.back.chatbot.vo.ChatMessageVO;
import kr.co.ictedu.back.chatbot.vo.ChatSessionVO;
import kr.co.ictedu.back.support.DbCrudFixtures;

@SpringBootTest
@Transactional
class ChatMessageCrudTest {
    @Autowired ChatMessageDAO messages;
    @Autowired ChatSessionDAO sessions;
    @Autowired MemberDAO members;

    // Implemented: append and read by session/member. No update/delete API.
    @Test
    void appendsUserAndBotMessagesAndIsolatesOtherMembers() {
        long member = DbCrudFixtures.member(members);
        long other = DbCrudFixtures.member(members);
        ChatSessionVO session = new ChatSessionVO();
        session.setMember_num(member);
        sessions.add(session);
        add(session.getChat_num(), "user", "CRUD question");
        add(session.getChat_num(), "bot", "CRUD answer");
        var stored = messages.list(session.getChat_num());
        assertEquals(2, stored.size());
        assertTrue(stored.stream().anyMatch(m -> "user".equals(m.getMessage_sender())
                && "CRUD question".equals(m.getMessage_content())));
        assertTrue(stored.stream().anyMatch(m -> "bot".equals(m.getMessage_sender())
                && "CRUD answer".equals(m.getMessage_content())));
        assertTrue(stored.stream().allMatch(m -> m.getMessage_num() > 0 && m.getMessage_regdate() != null));
        assertEquals(2, messages.memberList(member).size());
        assertTrue(messages.memberList(other).isEmpty());
        ChatSessionVO empty = new ChatSessionVO();
        empty.setMember_num(other);
        sessions.add(empty);
        assertTrue(messages.list(empty.getChat_num()).isEmpty());
    }

    private void add(int session, String sender, String content) {
        ChatMessageVO message = new ChatMessageVO();
        message.setChat_num(session);
        message.setMessage_sender(sender);
        message.setMessage_content(content);
        messages.add(message);
    }
}
