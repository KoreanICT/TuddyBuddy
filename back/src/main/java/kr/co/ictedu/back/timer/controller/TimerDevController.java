package kr.co.ictedu.back.timer.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import kr.co.ictedu.back.timer.dto.TimerDto;
import kr.co.ictedu.back.timer.service.TimerService;

/** 로컬 개발 전용: JWT 연동 전 DB 저장 검증용. 배포 금지. */
@Profile("local")
@RestController
@RequestMapping("/api/dev/timer-sessions")
public class TimerDevController {
    private final TimerService service;
    private static final Long TEST_MEMBER_NUM = 1L; // DB에 실제 존재하는 회원 번호로 교체

    public TimerDevController(TimerService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TimerDto.Session create(@RequestBody TimerDto.Create request) {
        return service.create(TEST_MEMBER_NUM, request);
    }

    @PutMapping("/{sessionId}/records")
    public TimerDto.Session save(
            @PathVariable("sessionId") Long sessionId,
            @RequestBody TimerDto.Save request) {

        return service.save(TEST_MEMBER_NUM, sessionId, request);
    }

    @GetMapping("/summary")
    public TimerDto.Summary summary() {
        return service.summary(TEST_MEMBER_NUM);
    }
}
