// 최솔
package kr.co.ictedu.back.timer.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import kr.co.ictedu.back.timer.dto.TimerDto;
import kr.co.ictedu.back.timer.service.TimerService;
import kr.co.ictedu.back.timer.service.TimerAuthenticatedMember;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "타이머", description = "타이머 API")
@RestController
@RequestMapping("/api/timer-sessions")
public class TimerController {

    private final TimerService service;
    private final TimerAuthenticatedMember authenticatedMember;

    public TimerController(
            TimerService service,
            TimerAuthenticatedMember authenticatedMember) {

        this.service = service;
        this.authenticatedMember = authenticatedMember;
    }

    @Operation(summary = "타이머 세션 생성")
    @PostMapping
    public ResponseEntity<TimerDto.Session> create(
            @RequestBody TimerDto.Create request) {

        Long memberNum = authenticatedMember.requireMemberNum();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(memberNum, request));
    }

    @Operation(summary = "타이머 기록 저장")
    @PutMapping("/{sessionId}/records")
    public TimerDto.Session save(
            @PathVariable("sessionId") Long sessionId,
            @RequestBody TimerDto.Save request) {

        Long memberNum = authenticatedMember.requireMemberNum();

        return service.save(memberNum, sessionId, request);
    }

    @Operation(summary = "타이머 학습 요약 조회")
    @GetMapping("/summary")
    public TimerDto.Summary summary() {

        Long memberNum = authenticatedMember.requireMemberNum();

        return service.summary(memberNum);
    }
}
