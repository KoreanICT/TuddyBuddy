//최솔
package kr.co.ictedu.back.timer.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.timer.dto.TimerDto;
import kr.co.ictedu.back.timer.service.TimerService;

import org.springframework.beans.factory.annotation.Value;//

@Tag(name = "타이머", description = "타이머 API")
@RestController
@RequestMapping("/api/timer-sessions")
public class TimerController {
	private final TimerService service;

	public TimerController(TimerService service) {
		this.service = service;
	}

	@Operation(summary = "타이머 세션 생성")
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TimerDto.Session create(@RequestBody TimerDto.Create request, HttpSession session) {
		return service.create(member(session), request);
	}

	@Operation(summary = "타이머 기록 저장")
	@PutMapping("/{sessionId}/records")
	public TimerDto.Session save(@PathVariable("sessionId") Long id, @RequestBody TimerDto.Save request,
			HttpSession session) {
		return service.save(member(session), id, request);
	}

	@Operation(summary = "타이머 학습 요약 조회")
	@GetMapping("/summary")
	public TimerDto.Summary summary(HttpSession session) {
		return service.summary(member(session));
	}

	private Long member(HttpSession session) {
		if (session.getAttribute("loginMember") instanceof MemberVO m && m.getMember_num() != null)
			return m.getMember_num();
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
	}

}
