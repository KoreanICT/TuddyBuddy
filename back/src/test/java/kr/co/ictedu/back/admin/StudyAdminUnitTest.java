package kr.co.ictedu.back.admin;

import static org.junit.jupiter.api.Assertions.*;
import java.lang.reflect.Proxy;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.admin.controller.StudyAdminController;
import kr.co.ictedu.back.admin.dao.StudyAdminDao;
import kr.co.ictedu.back.admin.service.StudyAdminService;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.notification.SseEmitterRepository;
import kr.co.ictedu.back.notification.dao.NotificationDao;
import kr.co.ictedu.back.notification.dto.NotificationDTO;
import kr.co.ictedu.back.notification.service.NotificationService;

class StudyAdminUnitTest {
    @TempDir Path root;
    List<String> calls = new ArrayList<>();
    List<NotificationDTO> sent = new ArrayList<>();
    Map<Long, NotificationDTO> saved = new HashMap<>();
    GroupVO group = new GroupVO();
    boolean failInsert;
    boolean failDelete;
    List<String> paths = new ArrayList<>();
    StudyAdminDao dao;
    StudyAdminService service;

    @SuppressWarnings("unchecked")
    static <T> T stub(Class<T> type, BiFunction<String, Object[], Object> fn) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (p,m,a) -> fn.apply(m.getName(),a));
    }
    @BeforeEach void setup() {
        TransactionSynchronizationManager.initSynchronization();
        group.setGroup_num(3L); group.setGroup_title("테스트 스터디");
        dao = stub(StudyAdminDao.class, (name,args) -> {
            calls.add(name);
            return switch(name) {
                case "lockGroup" -> group;
                case "memberNums" -> List.of(1L,2L);
                case "documentPaths" -> paths;
                case "tableExists" -> 1;
                case "count" -> 0;
                case "list" -> { assertEquals(1,args[1]); yield List.of(); }
                case "deleteGroup" -> { if (failDelete) throw new DataIntegrityViolationException("FK"); yield 1; }
                default -> 0;
            };
        });
        NotificationDao notifications = stub(NotificationDao.class, (name,args) -> {
            if (name.equals("insertNotification")) {
                if (failInsert) return 0;
                var dto = (NotificationDTO)args[0]; dto.setNotification_num((long)saved.size()+1);
                saved.put(dto.getNotification_num(),dto); return 1;
            }
            if (name.equals("getNotification")) return saved.get(args[1]);
            return null;
        });
        var sender = new NotificationService(notifications,new SseEmitterRepository(),null) {
            @Override public void send(Long memberNum, NotificationDTO dto) { sent.add(dto); }
        };
        service = new StudyAdminService(dao,notifications,sender,root.toString(),root.toString());
    }
    @AfterEach void cleanup() { TransactionSynchronizationManager.clearSynchronization(); }

    @Test void deletesChildrenAndNotifiesEveryMemberOnlyAfterCommit() throws Exception {
        Path file = root.resolve("document.jpg"); Files.writeString(file,"image"); paths.add(file.toString());
        service.delete(3L);
        assertTrue(sent.isEmpty()); assertTrue(Files.exists(file));
        assertEquals(2,saved.size());
        assertTrue(calls.indexOf("deleteDocuments") < calls.indexOf("deleteGroup"));
        assertTrue(calls.indexOf("memberNums") < calls.indexOf("deleteMembers"));
        TransactionSynchronizationManager.getSynchronizations().forEach(s -> s.afterCommit());
        assertEquals(List.of(1L,2L),sent.stream().map(NotificationDTO::getMember_num).toList());
        assertTrue(sent.stream().allMatch(n -> n.getCategory().equals("STUDY_DELETED") && n.getTarget_url().equals("/group")));
        assertFalse(Files.exists(file));
    }
    @Test void notificationFailurePreventsDeletion() {
        failInsert = true;
        assertThrows(IllegalStateException.class,() -> service.delete(3L));
        assertFalse(calls.contains("deleteGroup")); assertTrue(sent.isEmpty());
        assertTrue(TransactionSynchronizationManager.getSynchronizations().isEmpty());
    }
    @Test void missingGroupAndForeignKeyFailureDoNotSendDeletionNotice() {
        group = null;
        assertEquals(HttpStatus.NOT_FOUND,assertThrows(ResponseStatusException.class,() -> service.delete(3L)).getStatusCode());
        assertTrue(saved.isEmpty());
        group = new GroupVO(); group.setGroup_title("스터디"); failDelete = true;
        assertEquals(HttpStatus.CONFLICT,assertThrows(ResponseStatusException.class,() -> service.delete(3L)).getStatusCode());
        assertTrue(TransactionSynchronizationManager.getSynchronizations().isEmpty()); assertTrue(sent.isEmpty());
    }
    @Test void listClampsPageAndRejectsInvalidInput() {
        assertEquals(1,service.list(99,"").get("currentPage"));
        assertThrows(ResponseStatusException.class,() -> service.list(0,""));
    }
    @Test void onlyManagersMayDelete() {
        var members = new MemberService() {
            @Override public MemberVO getMemberByEmail(String email) {
                var member = new MemberVO(); member.setAuthority("MEMBER"); return member;
            }
        };
        var controller = new StudyAdminController(service,members);
        assertEquals(HttpStatus.UNAUTHORIZED,assertThrows(ResponseStatusException.class,() -> controller.delete(3L,null)).getStatusCode());
        var auth = new UsernamePasswordAuthenticationToken("member@test",null,List.of());
        assertEquals(HttpStatus.FORBIDDEN,assertThrows(ResponseStatusException.class,() -> controller.delete(3L,auth)).getStatusCode());
        assertTrue(calls.isEmpty());
    }
    @Test void mapperUsesBoundSearchAndOracle11gPaging() throws Exception {
        var config = new org.apache.ibatis.session.Configuration();
        config.getTypeAliasRegistry().registerAlias("groupvo",GroupVO.class);
        try(var input=org.apache.ibatis.io.Resources.getResourceAsStream("mappers/studyAdminMapper.xml")) {
            new org.apache.ibatis.builder.xml.XMLMapperBuilder(input,config,"mappers/studyAdminMapper.xml",config.getSqlFragments()).parse();
        }
        var sql=config.getMappedStatement("kr.co.ictedu.back.admin.dao.StudyAdminDao.list")
                .getBoundSql(Map.of("keyword","' OR 1=1 --","begin",1,"end",10)).getSql();
        assertTrue(sql.contains("ROW_NUMBER() OVER")); assertTrue(sql.contains("BETWEEN ? AND ?"));
        assertFalse(sql.contains("FETCH FIRST")); assertFalse(sql.contains("OR 1=1"));
    }
}
