package kr.co.ictedu.back.member.controller;

import java.util.Map;
import java.util.function.Supplier;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import kr.co.ictedu.back.member.service.AccountRecoveryService;

@RestController
@RequestMapping("/api/auth/recovery")
public class AccountRecoveryController {
    private final AccountRecoveryService recovery;
    public AccountRecoveryController(AccountRecoveryService recovery) { this.recovery = recovery; }
    public record EmailLookup(String name, String phone) {}
    public record RecoveryRequest(String email, String code) {}

    @PostMapping("/email")
    public ResponseEntity<?> findEmail(@RequestBody EmailLookup body, HttpServletRequest request) {
        return execute(() -> {
            recovery.limit("lookup", request.getRemoteAddr(), 20);
            return Map.of("emails", recovery.findEmails(body.name(), body.phone()));
        });
    }
    @PostMapping("/password/code")
    public ResponseEntity<?> sendCode(@RequestBody RecoveryRequest body, HttpServletRequest request) {
        return execute(() -> {
            recovery.limit("send", request.getRemoteAddr(), 20);
            recovery.sendCode(body.email());
            return Map.of("message", "가입된 일반 회원 이메일이라면 인증번호가 발송됩니다. 카카오 회원은 카카오 로그인을 이용해주세요.");
        });
    }
    @PostMapping("/password/reset")
    public ResponseEntity<?> reset(@RequestBody RecoveryRequest body, HttpServletRequest request) {
        return execute(() -> {
            recovery.limit("verify", request.getRemoteAddr(), 30);
            recovery.resetPassword(body.email(), body.code());
            return Map.of("message", "새 비밀번호를 이메일로 보냈습니다. 로그인 후 비밀번호를 변경해주세요.");
        });
    }
    private ResponseEntity<?> execute(Supplier<Object> action) {
        try { return ResponseEntity.ok(action.get()); }
        catch (ResponseStatusException e) { return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason() == null ? "요청을 처리할 수 없습니다." : e.getReason())); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
        catch (DataAccessException e) { return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", "계정 복구 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.")); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", "계정 복구에 실패했습니다. 잠시 후 인증번호를 다시 요청해주세요.")); }
    }
}
