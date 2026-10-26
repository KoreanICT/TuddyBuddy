package kr.co.ictedu.back.attendance;

import static org.junit.jupiter.api.Assertions.*;
import java.lang.reflect.Proxy;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.attendance.dao.AttendanceDao;
import kr.co.ictedu.back.attendance.service.AttendanceService;
import kr.co.ictedu.back.point.service.PointService;

class AttendanceRewardUnitTest {
    private AttendanceService service(List<String> calls, boolean duplicate, boolean rewardFailure) {
        AttendanceDao dao = (AttendanceDao) Proxy.newProxyInstance(
                AttendanceDao.class.getClassLoader(), new Class<?>[]{AttendanceDao.class}, (p, m, a) -> {
            if (m.getName().equals("getToday")) return "2026-10-26";
            if (m.getName().equals("findMonth")) return List.of();
            if (m.getName().equals("insertToday")) {
                if (duplicate) throw new DataIntegrityViolationException("duplicate",
                        new SQLException("UQ_ATTENDANCE_MEMBER_DAY", "23000", 1));
                assertEquals(300L, a[2]);
                calls.add("attendance");
                return 1;
            }
            throw new UnsupportedOperationException(m.getName());
        });
        PointService points = new PointService() {
            @Override public void addAttendanceReward(Long memberNum, String description) {
                assertEquals(7L, memberNum);
                assertTrue(description.contains("2026-10-26"));
                calls.add("reward");
                if (rewardFailure) throw new IllegalStateException("reward failed");
            }
        };
        return new AttendanceService(dao, points);
    }

    @Test void successfulAttendanceAwards300AfterInsert() {
        List<String> calls = new ArrayList<>();
        var response = service(calls, false, false).check(7L);
        assertEquals(List.of("attendance", "reward"), calls);
        assertEquals(300L, response.rewardPoint());
    }

    @Test void duplicateAttendanceDoesNotAwardPoints() {
        List<String> calls = new ArrayList<>();
        var error = assertThrows(ResponseStatusException.class,
                () -> service(calls, true, false).check(7L));
        assertEquals(409, error.getStatusCode().value());
        assertTrue(calls.isEmpty());
    }

    @Test void rewardFailurePropagatesToTransactionalCaller() {
        assertThrows(IllegalStateException.class,
                () -> service(new ArrayList<>(), false, true).check(7L));
    }

    @Test void monthlyResponseAdvertises300PointPolicy() {
        assertEquals(300L, service(new ArrayList<>(), false, false).getMonth(7L, "2026-10").rewardPerCheck());
    }
}
