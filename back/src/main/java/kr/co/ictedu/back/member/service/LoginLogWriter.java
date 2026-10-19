// 최원철
package kr.co.ictedu.back.member.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import kr.co.ictedu.back.member.dao.LoginLogDAO;
import kr.co.ictedu.back.member.vo.LoginLogVO;

@Service
public class LoginLogWriter {
    private final LoginLogDAO logs;

    public LoginLogWriter(LoginLogDAO logs) {
        this.logs = logs;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Long insert(LoginLogVO entry) {
        if (logs.insertLoginLog(entry) != 1 || entry.getLog_num() == null) {
            throw new IllegalStateException("Login log insert did not return an identifier");
        }
        return entry.getLog_num();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void finish(Long logNum, Long memberNum) {
        logs.finishLoginLog(logNum, memberNum);
    }
}
