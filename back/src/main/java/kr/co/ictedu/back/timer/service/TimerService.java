package kr.co.ictedu.back.timer.service;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import kr.co.ictedu.back.timer.dao.TimerDao;
import kr.co.ictedu.back.timer.dto.TimerDto;
import kr.co.ictedu.back.timer.vo.TimerSessionVO;
@Service
@Transactional(readOnly=true)
public class TimerService {
    private final TimerDao dao;
    public TimerService(TimerDao dao) { this.dao=dao; }
    @Transactional
    public TimerDto.Session create(Long memberNum, TimerDto.Create request) {
        int minutes=TimerPolicy.minutes(request==null ? null : request.setTimeMinutes());
        var session=new TimerSessionVO();
        session.setMember_num(memberNum); session.setSet_time_minutes(minutes); session.setTotal_time(0L);
        if (dao.insertSession(session)!=1) throw new IllegalStateException("타이머 생성 실패");
        return view(session);
    }
    @Transactional
    public TimerDto.Session save(Long memberNum, Long sessionId, TimerDto.Save request) {
        if (sessionId == null || sessionId <= 0) throw new IllegalArgumentException("올바른 타이머 번호가 필요합니다.");
        // 같은 세션의 저장을 직렬화. 다른 회원의 세션에는 접근 불가.
        var session=dao.lockSession(sessionId, memberNum);
        if (session==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"타이머를 찾을 수 없습니다.");
        var requested=TimerPolicy.normalize(request,sessionId);
        var saved=dao.selectIntervals(sessionId);
        if (!saved.isEmpty()) {
            if (TimerPolicy.same(saved,requested)) return view(session); // 응답 유실 후 재시도: 중복 INSERT/누적 없음
            throw new ResponseStatusException(HttpStatus.CONFLICT,"이미 저장된 세션입니다. 새 타이머를 시작해주세요.");
        }
        long seconds=TimerPolicy.seconds(requested,session.getSet_time_minutes(),Instant.now());
        for (var interval : requested)
            if (dao.insertInterval(interval)!=1) throw new IllegalStateException("공부 기록 저장 실패");
        // 기록 저장과 누적 값 갱신은 한 트랜잭션. 세션은 한 번만 완료 저장.
        if (dao.updateTotal(sessionId,seconds)!=1) throw new IllegalStateException("누적 시간 저장 실패");
        session.setTotal_time(seconds);
        return view(session);
    }
    public TimerDto.Summary summary(Long memberNum) {
        return new TimerDto.Summary(dao.selectTotal(memberNum),dao.selectRecent(memberNum).stream().map(TimerService::view).toList());
    }
    private static TimerDto.Session view(TimerSessionVO s) {
        return new TimerDto.Session(s.getTimer_session_id(),s.getSet_time_minutes(),s.getTotal_time());
    }
}
