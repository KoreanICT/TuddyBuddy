package kr.co.ictedu.back.selfstudy.controller;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice(assignableTypes = SelfStudyController.class)
public class SelfStudyExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> invalid(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> upstream(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason() == null ? "요청 실패" : e.getReason()));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> failure(Exception e) {
        org.slf4j.LoggerFactory.getLogger(getClass()).error("SelfStudy request failed", e);
        return ResponseEntity.internalServerError().body(Map.of("message", "처리 중 오류가 발생했습니다. 서버 로그를 확인해주세요."));
    }
}
