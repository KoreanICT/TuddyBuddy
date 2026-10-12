package kr.co.ictedu.back.selfstudy.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.selfstudy.dto.QuizGenerateRequestDto;
import kr.co.ictedu.back.selfstudy.dto.QuizSubmitRequestDto;
import kr.co.ictedu.back.selfstudy.service.SelfStudyService;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;

@RestController
@RequestMapping("/api/selfstudy")
public class SelfStudyController {

	 private final SelfStudyService selfStudyService;

	 public SelfStudyController(SelfStudyService selfStudyService) {
	        this.selfStudyService = selfStudyService;
	    }
	
//    @GetMapping("/test")
//    public String test() {
//        return "Spring Boot 정상";
//    }
    
    @GetMapping("/categories")
    public List<CategoryVO> getCategories() {
        return selfStudyService.getCategories();
    }
    
    //http://localhost/back/api/selfstudy/subjects?categoryId=1
    @GetMapping("/subjects")
    public List<SubjectVO> getSubjects(
            @RequestParam("categoryId") Long categoryId) {
        return selfStudyService.getSubjects(categoryId);
    }
    
//    @PostMapping("/generate")
//    public ResponseEntity<?> generateQuiz(
//            @ModelAttribute QuizGenerateRequestDto request, jakarta.servlet.http.HttpSession session) {
//        Object principal = session.getAttribute("loginMember");
//        if (!(principal instanceof kr.co.ictedu.back.member.vo.MemberVO member) || member.getMember_num() == null)
//            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
//        request.setMember_num(member.getMember_num());
//        return ResponseEntity.ok(
//                selfStudyService.generateQuiz(request)
//        );
//    }
//    
    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(
            @ModelAttribute QuizGenerateRequestDto request) {

        // 개발용: 로그인 없이 회원 1로 저장
        request.setMember_num(1L);

        return ResponseEntity.ok(
                selfStudyService.generateQuiz(request)
        );
    }
    // http://localhost/back/api/selfstudy/sessions?memberNum=1
    @GetMapping("/sessions")
    public List<QuizSessionVO> getSessions(
            jakarta.servlet.http.HttpSession session) {
        return selfStudyService.getSessions(requireMember(session));
    }

    // http://localhost/back/api/selfstudy/sessions/1
    @GetMapping("/sessions/{quizSessionId}")
    public QuizSessionVO getSession(
            @PathVariable("quizSessionId") Long quizSessionId, jakarta.servlet.http.HttpSession session) {
        selfStudyService.requireSessionOwner(quizSessionId, requireMember(session));

        return selfStudyService.getSession(quizSessionId);
    }
    
    // http://localhost/back/api/selfstudy/sessions/1/quizzes
    @GetMapping("/sessions/{quizSessionId}/quizzes")
    public List<QuizVO> getQuizzes(
            @PathVariable("quizSessionId") Long quizSessionId, jakarta.servlet.http.HttpSession session) {
        selfStudyService.requireSessionOwner(quizSessionId, requireMember(session));

        return selfStudyService.getQuizzes(quizSessionId);
    }
    
//    @PostMapping("/submit")
//    public SelfStudyResultVO submitQuiz(
//            @RequestBody QuizSubmitRequestDto request, jakarta.servlet.http.HttpSession session) {
//        request.setMember_num(requireMember(session));
//        selfStudyService.requireSessionOwner(request.getQuiz_sessionid(), request.getMember_num());
//        return selfStudyService.submitQuiz(request);
//    }
    @PostMapping("/submit")
    public SelfStudyResultVO submitQuiz(
            @RequestBody QuizSubmitRequestDto request) {

        // 개발용: generate와 동일한 회원 번호
        request.setMember_num(1L);

        selfStudyService.requireSessionOwner(
                request.getQuiz_sessionid(),
                request.getMember_num()
        );

        return selfStudyService.submitQuiz(request);
    }
    // http://localhost/back/api/selfstudy/results/1
    @GetMapping("/results")
    public List<SelfStudyResultVO> getResults(
            jakarta.servlet.http.HttpSession session) {
        return selfStudyService.getResults(requireMember(session));
    }
    
    // http://localhost/back/api/selfstudy/results/1
    @GetMapping("/results/{resultId}")
    public SelfStudyResultVO getResult(
            @PathVariable("resultId") Long resultId, jakarta.servlet.http.HttpSession session) {
        selfStudyService.requireResultOwner(resultId, requireMember(session));
        return selfStudyService.getResult(resultId);
    }
    

    // http://localhost/back/api/selfstudy/sessions/1
    @DeleteMapping("/sessions/{quizSessionId}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable("quizSessionId") Long quizSessionId, jakarta.servlet.http.HttpSession session) {
        selfStudyService.requireSessionOwner(quizSessionId, requireMember(session));

        selfStudyService.deleteSession(quizSessionId);

        return ResponseEntity.noContent().build();
    }

    // http://localhost/back/api/selfstudy/results/1/responses
    @GetMapping("/results/{resultId}/responses")
    public List<QuizResponseVO> getResponses(
            @PathVariable("resultId") Long resultId, jakarta.servlet.http.HttpSession session) {
        selfStudyService.requireResultOwner(resultId, requireMember(session));
        return selfStudyService.getResponses(resultId);
    }
  
    private Long requireMember(jakarta.servlet.http.HttpSession session) {
        Object principal = session.getAttribute("loginMember");
        if (!(principal instanceof kr.co.ictedu.back.member.vo.MemberVO member) || member.getMember_num() == null)
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        return member.getMember_num();
    }
}
