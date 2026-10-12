package kr.co.ictedu.back.timer.controller;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@RestControllerAdvice(assignableTypes=TimerController.class)
public class TimerExceptionHandler {
    private static final Logger log=LoggerFactory.getLogger(TimerExceptionHandler.class);
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> invalid(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> malformed(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(Map.of("message","요청 형식과 날짜 형식을 확인해주세요."));
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"요청 실패":e.getReason()));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> failure(Exception e) {
        log.error("Timer operation failed",e);
        return ResponseEntity.internalServerError().body(Map.of("message","저장하지 못했습니다. 다시 시도해주세요."));
    }
}
