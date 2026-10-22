package kr.co.ictedu.back.friend;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.friend.dao.FriendDao;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.friend.vo.FriendVO;
import kr.co.ictedu.back.support.CoreCrudFixtures;

@SpringBootTest
@Transactional
class FriendCrudTest {
    @Autowired FriendDao dao;
    @Autowired MemberDAO members;

    @Test
    void requestAcceptReadAndDeleteWithParticipantChecks() {
        Long sender = CoreCrudFixtures.member(members, "MEMBER");
        Long receiver = CoreCrudFixtures.member(members, "MEMBER");
        Long outsider = CoreCrudFixtures.member(members, "MEMBER");
        Long id = request(sender, receiver);
        assertEquals("PENDING", dao.detail(id).getStatus());
        assertEquals(sender, dao.detail(id).getRequest_num());
        assertEquals(receiver, dao.detail(id).getResponse_num());
        assertEquals(1, dao.checkDuplicate(receiver, sender));
        assertEquals(id, dao.requestList(receiver).getFirst().getNum());
        assertEquals(id, dao.responseList(sender).getFirst().getNum());
        assertEquals(0, dao.accept(id, outsider));
        assertEquals("PENDING", dao.detail(id).getStatus());
        assertEquals(1, dao.accept(id, receiver));
        assertEquals("ACCEPTED", dao.detail(id).getStatus());
        assertEquals(id, dao.friendList(sender).getFirst().getNum());
        assertEquals(id, dao.friendList(receiver).getFirst().getNum());
        assertEquals(0, dao.del(id, outsider));
        assertEquals(1, dao.del(id, sender));
        assertNull(dao.detail(id));
        assertTrue(dao.friendList(receiver).isEmpty());
    }

    @Test
    void rejectOnlyPendingRequestForReceiver() {
        Long sender = CoreCrudFixtures.member(members, "MEMBER");
        Long receiver = CoreCrudFixtures.member(members, "MEMBER");
        Long id = request(sender, receiver);
        assertEquals(0, dao.reject(id, sender));
        assertEquals(1, dao.reject(id, receiver));
        assertEquals("REJECTED", dao.detail(id).getStatus());
        assertTrue(dao.requestList(receiver).isEmpty());
        assertEquals(0, dao.accept(id, receiver));
        assertEquals(0, dao.checkDuplicate(sender, receiver));
    }

    private Long request(Long sender, Long receiver) {
        FriendVO input = new FriendVO();
        input.setRequest_num(sender);
        input.setResponse_num(receiver);
        dao.add(input);
        return dao.responseList(sender).stream().filter(row -> receiver.equals(row.getResponse_num()))
                .findFirst().orElseThrow().getNum();
    }
}
