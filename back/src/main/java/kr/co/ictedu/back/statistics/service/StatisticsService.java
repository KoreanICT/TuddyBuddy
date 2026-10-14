package kr.co.ictedu.back.statistics.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;

@Service
public class StatisticsService {
	// 1. @Autowired를 이용한 필드 주입 방식 적용
	@Autowired
	private SelfStudyDao selfStudyDao;
	
	
	public List<String> selectCategories(Long memberNum) {
		//카테고리 추출
		List<String> categories = selfStudyDao.selectCategories_Statistics(memberNum);
		return categories;
	}

	public Map<String, Object> selectStatistics(Long memberNum) {
		
		Long sessionId = selfStudyDao.selectSessionId_Statistics(memberNum);
		
		// 2. 학습 결과 단건 조회 (세션 ID 및 회원 번호 확인용)
		SelfStudyResultVO result = selfStudyDao.selectResult(sessionId);
		if (result == null) {
			throw new IllegalArgumentException("존재하지 않는 학습 결과입니다.");
		}

		
		// 3. 해당 세션의 전체 문제 목록 조회 (기존 쿼리 재사용)
		List<QuizVO> quizzes = selfStudyDao.selectQuizzes(result.getQuiz_session_id());

		// 4. 해당 결과의 유저 답변 목록 조회 (기존 쿼리 재사용)
		List<QuizResponseVO> responses = selfStudyDao.selectQuizResponses(memberNum);

		// 5. 문제와 유저 답변을 맵핑하여 오답(`quiz_correct == 'N'`)만 골라내어 Map 리스트로 구성
		List<Map<String, Object>> quizLogs = new ArrayList<>();

		for (QuizVO quiz : quizzes) {
			QuizResponseVO matchResponse = responses.stream().filter(r -> r.getQuiz_id().equals(quiz.getQuiz_id()))
					.findFirst().orElse(null);

			// 답변이 존재하고, 틀린 문제인 경우만 필터링
			if (matchResponse != null && "N".equalsIgnoreCase(matchResponse.getQuiz_correct())) {
				Map<String, Object> logMap = new HashMap<>();
				logMap.put("quiz_id", quiz.getQuiz_id());
				logMap.put("question", quiz.getQuiz_question());

				// 선택지(보기) 처리 
				logMap.put("options", quiz.getQuiz_selections());
				logMap.put("user_answer", matchResponse.getQuiz_user_response());
				logMap.put("correct_answer", quiz.getQuiz_correct_answer());
				logMap.put("is_correct", false); // 오답이므로 고정 또는 판별값 대입
				logMap.put("explanation", quiz.getQuiz_explanation());

				quizLogs.add(logMap);
			}
		}

		// 6. FastAPI로 보낼 최종 요청 Payload(Body) 구성
		Map<String, Object> requestPayload = new HashMap<>();
		requestPayload.put("user_id", result.getMember_num());
		requestPayload.put("quiz_logs", quizLogs);

		// 6. RestTemplate을 통해 FastAPI 서버로 POST 요청 전송 (루트 경로 "/")
		RestTemplate restTemplate = new RestTemplate();
		String fastapiUrl = "http://localhost:8000/"; // FastAPI 서버 주소 (포트 확인)

		// postForObject를 이용해 요청을 보내고 Map 형태로 응답 받기
		Map<String, Object> aiResponse = restTemplate.postForObject(fastapiUrl, requestPayload, Map.class);

		// 7. DB 저장 없이 곧바로 반환 (일회성 증발 데이터)
		return aiResponse;
	}
}
