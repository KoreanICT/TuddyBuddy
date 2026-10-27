package kr.co.ictedu.back.friend;

import static org.junit.jupiter.api.Assertions.*;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import kr.co.ictedu.back.friend.dao.FriendDao;
import kr.co.ictedu.back.friend.service.FriendService;
import kr.co.ictedu.back.friend.vo.FriendVO;
import kr.co.ictedu.back.notification.NotificationPublisher;
import kr.co.ictedu.back.notification.NotificationEvent.Category;

class FriendNotificationUnitTest {
    @Test void savedRequestNotifiesRecipientAndDuplicateDoesNotNotify() {
        List<String> calls = new ArrayList<>();
        FriendDao dao = (FriendDao) Proxy.newProxyInstance(FriendDao.class.getClassLoader(),
                new Class<?>[]{FriendDao.class}, (p,m,a) -> {
                    if (m.getName().equals("checkDuplicate")) return calls.isEmpty() ? 0 : 1;
                    if (m.getName().equals("add")) { calls.add("saved"); return null; }
                    throw new UnsupportedOperationException(m.getName());
                });
        NotificationPublisher publisher = new NotificationPublisher() {
            @Override public void send(Long memberNum, Category category, String title, String message, String url) {
                assertEquals(2L, memberNum);
                assertEquals(Category.FRIEND_REQUEST, category);
                assertEquals("/friend/request", url);
                assertEquals(List.of("saved"), calls);
                calls.add("notified");
            }
        };
        FriendService service = new FriendService();
        ReflectionTestUtils.setField(service, "friendDao", dao);
        ReflectionTestUtils.setField(service, "notifications", publisher);
        FriendVO vo = new FriendVO();
        vo.setRequest_num(1L); vo.setResponse_num(2L);
        service.add(vo);
        assertEquals(List.of("saved", "notified"), calls);
        assertThrows(IllegalArgumentException.class, () -> service.add(vo));
        assertEquals(2, calls.size());
    }
}
