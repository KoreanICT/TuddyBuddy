package kr.co.ictedu.back.attendance;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.attendance.controller.AttendanceController;
import kr.co.ictedu.back.attendance.dao.AttendanceDao;
import kr.co.ictedu.back.attendance.service.AttendanceService;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.point.service.PointService;
import kr.co.ictedu.back.point.vo.PointVO;

class PointHistoryQueryTest {
    @Test
    void delegatesToPointServiceWithoutAttendanceWrites() {
        AttendanceDao dao = mock(AttendanceDao.class);
        PointService points = mock(PointService.class);
        PointVO item = new PointVO();
        item.setAmount(300L);
        List<PointVO> result = List.of(item);
        when(points.selectPointHistory(28L)).thenReturn(result);
        assertSame(result, new AttendanceService(dao, points).getPointHistory(28L));
        verify(points).selectPointHistory(28L);
        verifyNoMoreInteractions(points);
        verifyNoInteractions(dao);
    }

    @Test
    void resolvesMemberNumberFromAuthentication() {
        AttendanceService service = mock(AttendanceService.class);
        MemberService members = mock(MemberService.class);
        MemberVO member = new MemberVO();
        member.setMember_num(28L);
        when(members.getMemberByEmail("member@example.invalid")).thenReturn(member);
        when(service.getPointHistory(28L)).thenReturn(List.of());
        var auth = new UsernamePasswordAuthenticationToken("member@example.invalid", null, List.of());
        assertEquals(List.of(), new AttendanceController(service, members).getPointHistory(auth));
        verify(service).getPointHistory(28L);
    }

    @Test
    void rejectsUnauthenticatedRequestsBeforeLookup() {
        AttendanceService service = mock(AttendanceService.class);
        MemberService members = mock(MemberService.class);
        var error = assertThrows(ResponseStatusException.class,
                () -> new AttendanceController(service, members).getPointHistory(null));
        assertEquals(401, error.getStatusCode().value());
        verifyNoInteractions(service, members);
    }

    @Test
    void databaseFailureDoesNotExposeSqlDetails() {
        AttendanceService service = mock(AttendanceService.class);
        MemberService members = mock(MemberService.class);
        MemberVO member = new MemberVO();
        member.setMember_num(28L);
        when(members.getMemberByEmail("member@example.invalid")).thenReturn(member);
        when(service.getPointHistory(28L)).thenThrow(new DataAccessResourceFailureException("private SQL"));
        var auth = new UsernamePasswordAuthenticationToken("member@example.invalid", null, List.of());
        var error = assertThrows(ResponseStatusException.class,
                () -> new AttendanceController(service, members).getPointHistory(auth));
        assertEquals(503, error.getStatusCode().value());
        assertFalse(error.getReason().contains("private SQL"));
    }
}
