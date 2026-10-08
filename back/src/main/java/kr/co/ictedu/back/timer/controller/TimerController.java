package kr.co.ictedu.back.timer.controller;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.timer.dto.TimerDto;
import kr.co.ictedu.back.timer.service.TimerService;

import org.springframework.beans.factory.annotation.Value;//

@RestController
@RequestMapping("/api/timer-sessions")
public class TimerController {
    private final TimerService service;
    public TimerController(TimerService service) { this.service=service; }
    @PostMapping 
    @ResponseStatus(HttpStatus.CREATED)
    public TimerDto.Session create(@RequestBody TimerDto.Create request,HttpSession session) {
        return service.create(member(session),request);
    }
   
    @PutMapping("/{sessionId}/records")
    public TimerDto.Session save(@PathVariable("sessionId") Long id,@RequestBody TimerDto.Save request,HttpSession session) {
        return service.save(member(session),id,request);
    }
    @GetMapping("/summary")
    public TimerDto.Summary summary(HttpSession session) { return service.summary(member(session)); }
    private Long member(HttpSession session) {
        if (session.getAttribute("loginMember") instanceof MemberVO m && m.getMember_num()!=null)
            return m.getMember_num();
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"로그인이 필요합니다.");
    }
    
}
