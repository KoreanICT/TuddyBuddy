//최솔
package kr.co.ictedu.back.selfstudy.controller;

import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.tags.Tag;
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
import kr.co.ictedu.back.selfstudy.service.AuthenticatedMember;


@Tag(name = "셀프스터디", description = "셀프스터디 API")
@RestController
@RequestMapping("/api/selfstudy")
public class SelfStudyController {

	private final SelfStudyService selfStudyService;
	private final AuthenticatedMember authenticatedMember;

	public SelfStudyController(
	        SelfStudyService selfStudyService,
	        AuthenticatedMember authenticatedMember
	) {
	    this.selfStudyService = selfStudyService;
	    this.authenticatedMember = authenticatedMember;
	}

	@Operation(summary = "카테고리 목록 조회")
	@GetMapping("/categories")
	public List<CategoryVO> getCategories() {
		return selfStudyService.getCategories();
	}

	// http://localhost/back/api/selfstudy/subjects?categoryId=1
	@Operation(summary = "과목 목록 조회")
	@GetMapping("/subjects")
	public List<SubjectVO> getSubjects(@RequestParam("categoryId") Long categoryId) {
		return selfStudyService.getSubjects(categoryId);
	}


	@Operation(summary = "AI 퀴즈 생성")
	@PostMapping("/generate")
	public ResponseEntity<?> generateQuiz(@ModelAttribute QuizGenerateRequestDto request) {

		request.setMember_num(authenticatedMember.requireId());

		return ResponseEntity.ok(selfStudyService.generateQuiz(request));
	}

	@Operation(summary = "내 퀴즈 세션 목록 조회")
	@GetMapping("/sessions")
	public ResponseEntity<List<QuizSessionVO>> getSessions() {
		return ResponseEntity.ok(selfStudyService.getSessions(authenticatedMember.requireId()));
	}

	// http://localhost/back/api/selfstudy/sessions/1
	@Operation(summary = "퀴즈 세션 상세 조회")
	@GetMapping("/sessions/{quizSessionId}")
	public QuizSessionVO getSession(@PathVariable("quizSessionId") Long quizSessionId) {
		selfStudyService.requireSessionOwner(quizSessionId, authenticatedMember.requireId());

		return selfStudyService.getSession(quizSessionId);
	}

	// http://localhost/back/api/selfstudy/sessions/1/quizzes
	@Operation(summary = "세션 문제 목록 조회")
	@GetMapping("/sessions/{quizSessionId}/quizzes")
	public List<QuizVO> getQuizzes(@PathVariable("quizSessionId") Long quizSessionId) {
		selfStudyService.requireSessionOwner(quizSessionId, authenticatedMember.requireId());

		return selfStudyService.getQuizzes(quizSessionId);
	}


	@Operation(summary = "퀴즈 답안 제출")
	@PostMapping("/submit")
	public SelfStudyResultVO submitQuiz(@RequestBody QuizSubmitRequestDto request) {

		request.setMember_num(authenticatedMember.requireId());

		selfStudyService.requireSessionOwner(request.getQuiz_sessionid(), request.getMember_num());

		return selfStudyService.submitQuiz(request);
	}

	// http://localhost/back/api/selfstudy/results/1
	@Operation(summary = "내 학습 결과 목록 조회")
	@GetMapping("/results")
	public ResponseEntity<List<SelfStudyResultVO>> getResults() {
		return ResponseEntity.ok(selfStudyService.getResults(authenticatedMember.requireId()));
	}

	// http://localhost/back/api/selfstudy/results/1
	@Operation(summary = "학습 결과 상세 조회")
	@GetMapping("/results/{resultId}")
	public SelfStudyResultVO getResult(@PathVariable("resultId") Long resultId) {
		selfStudyService.requireResultOwner(resultId, authenticatedMember.requireId());
		return selfStudyService.getResult(resultId);
	}

	// http://localhost/back/api/selfstudy/sessions/1
	@Operation(summary = "퀴즈 세션 상세 조회")
	@DeleteMapping("/sessions/{quizSessionId}")
	public ResponseEntity<Void> deleteSession(@PathVariable("quizSessionId") Long quizSessionId) {
		selfStudyService.requireSessionOwner(quizSessionId, authenticatedMember.requireId());

		selfStudyService.deleteSession(quizSessionId);

		return ResponseEntity.noContent().build();
	}

	// http://localhost/back/api/selfstudy/results/1/responses
	@Operation(summary = "학습 결과별 답안 조회")
	@GetMapping("/results/{resultId}/responses")
	public List<QuizResponseVO> getResponses(@PathVariable("resultId") Long resultId) {
		selfStudyService.requireResultOwner(resultId, authenticatedMember.requireId());
		return selfStudyService.getResponses(resultId);
	}

}
