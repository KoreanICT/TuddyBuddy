package kr.co.ictedu.back.selfstudy.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @Autowired
    private SelfStudyService selfStudyService;
    
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
    // http://localhost/back/api/selfstudy/sessions?memberNum=1
    @GetMapping("/sessions")
    public List<QuizSessionVO> getSessions() {
        return selfStudyService.getSessions();
    }
    // http://localhost/back/api/selfstudy/sessions/1
    @GetMapping("/sessions/{quizSessionId}")
    public QuizSessionVO getSession(
            @PathVariable("quizSessionId") Long quizSessionId) {
        return selfStudyService.getSession(quizSessionId);
    }
// // http://localhost/back/api/selfstudy/sessions/1/quizzes
    @GetMapping("/sessions/{quizSessionId}/quizzes")
    public List<QuizVO> getQuizzes(
            @PathVariable("quizSessionId") Long quizSessionId) {

        return selfStudyService.getQuizzes(quizSessionId);
    }
    // http://localhost/back/api/selfstudy/results/1
    @GetMapping("/results")
    public List<SelfStudyResultVO> getResults() {

        return selfStudyService.getResults();
    }
    // http://localhost/back/api/selfstudy/results/1
    @GetMapping("/results/{resultId}")
    public SelfStudyResultVO getResult(
            @PathVariable("resultId") Long resultId) {
        return selfStudyService.getResult(resultId);
    }
    // http://localhost/back/api/selfstudy/sessions/1
    @DeleteMapping("/sessions/{quizSessionId}")
    public void deleteSession(
            @PathVariable("quizSessionId") Long quizSessionId) {
        selfStudyService.deleteSession(quizSessionId);
    }
 // http://localhost/back/api/selfstudy/results/1/responses
    @GetMapping("/results/{resultId}/responses")
    public List<QuizResponseVO> getResponses(
            @PathVariable("resultId") Long resultId) {
        return selfStudyService.getResponses(resultId);
    }
 // 결과 저장
 // POST http://localhost/back/api/selfstudy/results
    @PostMapping("/results")
    public SelfStudyResultVO insertResult(
        @RequestBody SelfStudyResultVO vo) {
     selfStudyService.insertResult(vo);
     return vo;
 }
 // 문제별 답변 저장
 // POST http://localhost/back/api/selfstudy/results/1/responses
    @PostMapping("/results/{resultId}/responses")
    public QuizResponseVO insertQuizResponse(
         @PathVariable("resultId") Long resultId,
         @RequestBody QuizResponseVO vo) {

     vo.setSelfstudy_results_id(resultId);

     selfStudyService.insertQuizResponse(vo);

     return vo;
 }
    @PostMapping("/sessions")
    public QuizSessionVO insertSession(
            @RequestBody QuizSessionVO vo) {

        selfStudyService.insertQuizSession(vo);

        return vo;
    }
    
    
    
}
