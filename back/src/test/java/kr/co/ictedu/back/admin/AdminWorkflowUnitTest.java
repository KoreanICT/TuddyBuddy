package kr.co.ictedu.back.admin;

import static org.junit.jupiter.api.Assertions.*;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiFunction;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.admin.controller.BoardAdminController;
import kr.co.ictedu.back.admin.dao.BoardAdminDao;
import kr.co.ictedu.back.admin.service.BoardAdminService;
import kr.co.ictedu.back.group.dao.DocumentDao;
import kr.co.ictedu.back.group.dao.GroupDao;
import kr.co.ictedu.back.group.service.DocumentService;
import kr.co.ictedu.back.group.vo.DocumentVO;
import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.notification.NotificationEvent.Category;
import kr.co.ictedu.back.notification.NotificationPublisher;
import kr.co.ictedu.back.report.dao.ReportDao;
import kr.co.ictedu.back.report.dao.ReportReplyDao;
import kr.co.ictedu.back.report.service.ReportService;
import kr.co.ictedu.back.report.service.ReportReplyService;
import kr.co.ictedu.back.report.vo.ReportVO;
import kr.co.ictedu.back.report.vo.ReportReplyVO;

class AdminWorkflowUnitTest {
    @Test void boardMapperBuildsParameterizedOracle11gQueries() throws Exception {
        var configuration = new org.apache.ibatis.session.Configuration();
        try (var input = org.apache.ibatis.io.Resources.getResourceAsStream("mappers/boardAdminMapper.xml")) {
            new org.apache.ibatis.builder.xml.XMLMapperBuilder(input, configuration,
                    "mappers/boardAdminMapper.xml", configuration.getSqlFragments()).parse();
        }
        String prefix = "kr.co.ictedu.back.admin.dao.BoardAdminDao.";
        var parameters = java.util.Map.of("keyword", "' OR 1=1 --", "begin", 1, "end", 10);
        var bound = configuration.getMappedStatement(prefix + "list").getBoundSql(parameters);
        assertTrue(bound.getSql().contains("ROW_NUMBER() OVER"));
        assertTrue(bound.getSql().contains("BETWEEN ? AND ?"));
        assertFalse(bound.getSql().contains("FETCH FIRST"));
        assertFalse(bound.getSql().contains("OR 1=1"));
        assertEquals(4, bound.getParameterMappings().size());
        String empty = configuration.getMappedStatement(prefix + "count")
                .getBoundSql(java.util.Map.of("keyword", "")).getSql();
        assertFalse(empty.contains("INSTR"));
    }
    @SuppressWarnings("unchecked")
    private static <T> T stub(Class<T> type, BiFunction<String, Object[], Object> handler) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (proxy, method, args) -> handler.apply(method.getName(), args));
    }
    private static MemberVO member(String role) {
        var m = new MemberVO(); m.setMember_num(8L); m.setAuthority(role); return m;
    }
    private static final class Notices extends NotificationPublisher {
        final List<String> sent = new ArrayList<>();
        @Override public void send(Long num, Category category, String title, String message, String url) {
            sent.add(num + ":" + url);
        }
    }
    private static ReportVO report(String status) {
        var r = new ReportVO(); r.setNum(7L); r.setMember_num(8L); r.setStatus(status); return r;
    }

    @Test void boardRequiresManagerAndAnonymousIsRejected() {
        MemberService members = new MemberService() {
            @Override public MemberVO getMemberByEmail(String email) { return member("MEMBER"); }
        };
        var controller = new BoardAdminController(new BoardAdminService(null), members);
        var auth = new UsernamePasswordAuthenticationToken("member@test", null, List.of());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class,
                () -> controller.list(1, "", auth)).getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ResponseStatusException.class,
                () -> controller.delete(7L, null)).getStatusCode());
    }

    @Test void boardDeletesChildrenFirstAndClampsEmptyLastPage() {
        var calls = new ArrayList<String>();
        var dao = stub(BoardAdminDao.class, (name, args) -> {
            calls.add(name);
            return switch(name) {
                case "count" -> 0;
                case "list" -> { assertEquals(1, args[1]); assertEquals(10, args[2]); yield List.of(); }
                case "lockPost" -> 7L;
                case "deleteComments", "deletePost" -> 1;
                default -> null;
            };
        });
        var service = new BoardAdminService(dao);
        assertEquals(1, service.list(9, "").get("currentPage"));
        calls.clear(); service.delete(7L);
        assertEquals(List.of("lockPost", "deleteComments", "deletePost"), calls);
    }

    @Test void downloadUsesAuthenticatedMemberAndAllowsManagerReview() {
        var doc = new DocumentVO(); doc.setGroup_num(3L);
        var service = new DocumentService();
        ReflectionTestUtils.setField(service, "dao", stub(DocumentDao.class, (n,a) -> doc));
        ReflectionTestUtils.setField(service, "groups", stub(GroupDao.class, (n,a) -> 0));
        ReflectionTestUtils.setField(service, "members", stub(MemberDAO.class, (n,a) -> member("MEMBER")));
        var auth = new UsernamePasswordAuthenticationToken("member@test", null, List.of());
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ResponseStatusException.class,
                () -> service.getDownloadDocument(2L, null)).getStatusCode());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class,
                () -> service.getDownloadDocument(2L, auth)).getStatusCode());
        ReflectionTestUtils.setField(service, "members", stub(MemberDAO.class, (n,a) -> member("SUB_ADMIN")));
        assertSame(doc, service.getDownloadDocument(2L, auth));
        ReflectionTestUtils.setField(service, "members", stub(MemberDAO.class, (n,a) -> member("MEMBER")));
        ReflectionTestUtils.setField(service, "groups", stub(GroupDao.class, (n,a) -> 1));
        assertSame(doc, service.getDownloadDocument(2L, auth));
    }

    @Test void reportCreationNotifiesManagersWithGeneratedReportNumber() {
        var service = new ReportService(); var notices = new Notices();
        ReflectionTestUtils.setField(service, "notifications", notices);
        ReflectionTestUtils.setField(service, "members", stub(MemberDAO.class, (n,a) -> List.of(1L,2L)));
        ReflectionTestUtils.setField(service, "reportDao", stub(ReportDao.class, (n,a) -> {
            if (n.equals("add")) ((ReportVO)a[0]).setNum(7L);
            return null;
        }));
        var report = report("PENDING"); report.setType("report"); report.setTarget_num(0L);
        report.setCategory("test"); report.setContent("test");
        service.add(report);
        assertEquals(List.of("1:/admin/reportDetail/7", "2:/admin/reportDetail/7"), notices.sent);
    }

    @Test void unchangedStatusDoesNotSendDuplicateNotification() {
        var service = new ReportService(); var notices = new Notices();
        ReflectionTestUtils.setField(service, "notifications", notices);
        ReflectionTestUtils.setField(service, "reportDao", stub(ReportDao.class, (n,a) ->
                n.equals("lockDetail") ? report("REVIEWING") : 1));
        var request = report("REVIEWING"); service.updateStatus(request);
        assertTrue(notices.sent.isEmpty());
        request.setStatus("COMPLETED"); service.updateStatus(request);
        assertEquals(List.of("8:/report/replyDetail/7"), notices.sent);
    }

    @Test void replyOptOutWorksAndStatusChangeDoesNotDoubleNotify() {
        var service = new ReportReplyService(); var notices = new Notices();
        ReflectionTestUtils.setField(service, "notifications", notices);
        ReflectionTestUtils.setField(service, "reportService", new ReportService());
        ReflectionTestUtils.setField(service, "reportDao", stub(ReportDao.class, (n,a) ->
                n.equals("lockDetail") ? report("PENDING") : 1));
        ReflectionTestUtils.setField(service, "reportReplyDao", stub(ReportReplyDao.class, (n,a) ->
                n.equals("countByReport") ? 0 : null));
        var reply = new ReportReplyVO(); reply.setReport_num(7L); reply.setContent("reply");
        service.addWithStatus(reply, "COMPLETED", false); assertTrue(notices.sent.isEmpty());
        service.addWithStatus(reply, "COMPLETED", true);
        assertEquals(List.of("8:/report/replyDetail/7"), notices.sent);
    }
}
