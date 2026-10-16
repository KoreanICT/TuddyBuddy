//김진규
package kr.co.ictedu.back.statistics.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import io.swagger.v3.oas.models.PathItem.HttpMethod;
import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
import kr.co.ictedu.back.statistics.dao.StatisticsDao;
import kr.co.ictedu.back.statistics.dto.LlmFeedbackResponseDTO;

@Service
public class StatisticsService {
	// 1. @Autowired를 이용한 필드 주입 방식 적용
	@Autowired
	private SelfStudyDao selfStudyDao;

	@Autowired
	private StatisticsDao statisticsDao;

	@Value("${fastapi.url}")
	private String fastapiUrl;

	public List<String> selectCategories(Long memberNum) {
		// 카테고리 추출
		List<String> categories = statisticsDao.selectCategories_Statistics(memberNum);
		return categories;
	}

	/**
	 * 1. 최종 통합 통계 데이터 조회 (컨트롤러에서 호출하는 메인 메서드)
	 */
	public Map<String, Object> selectStatistics(Long memberNum) {
		// (1) LLM 데이터(피드백) 추출 메서드 호출
		LlmFeedbackResponseDTO llmFeedback = getLlmFeedbackData(memberNum);
		// (2) 차트 데이터 추출 메서드 호출
		Map<String, Object> chartData = getChartData(memberNum);
		System.out.println("chart데이터: " + chartData);
		// (3) 두 데이터를 하나의 맵으로 묶어서 리액트로 반환
		Map<String, Object> finalResult = new HashMap<>();
		finalResult.put("chartData", chartData);
		finalResult.put("llmFeedback", llmFeedback);
		System.out.println("통합데이터: " + finalResult);
		return finalResult;
	}

	/**
	 * 2. DB 조인 쿼리를 활용한 LLM 피드백 데이터 추출 및 FastAPI 통신 메서드
	 */
	private LlmFeedbackResponseDTO getLlmFeedbackData(Long memberNum) {
		// (1) 세션 ID 추출
		Long sessionId = statisticsDao.selectSessionId_Statistics(memberNum);

		// (2) 학습 결과 단건 조회 (결과 존재 여부 검증 및 selfstudy_results_id 확보용)
		SelfStudyResultVO result = statisticsDao.selectResult(sessionId);
		if (result == null) {
			throw new IllegalArgumentException("존재하지 않는 학습 결과입니다.");
		}

		// (3) 최적화된 조인 쿼리를 통해 해당 결과의 오답 로그 목록을 곧바로 조회
		// (더미 데이터 기준으로 selfstudy_results_id를 전달하여 오답 'N'만 추출)
		List<Map<String, Object>> quizLogs = statisticsDao
				.selectIncorrectQuizzesByResultId_Statistics(result.getSelfstudy_results_id());

		// (4) FastAPI로 보낼 최종 요청 Payload(Body) 구성
		Map<String, Object> requestPayload = new HashMap<>();
		requestPayload.put("user_id", result.getMember_num());
		requestPayload.put("quiz_logs", quizLogs);

		// (5) RestTemplate을 통해 FastAPI 서버로 POST 요청 전송
		RestTemplate restTemplate = new RestTemplate();
		LlmFeedbackResponseDTO llmFeedback = restTemplate.postForObject(fastapiUrl + "/requestPayload", requestPayload,
				LlmFeedbackResponseDTO.class 
		);

		System.out.println("llm데이터 수신 성공: " + llmFeedback.getMentorComment());
		return llmFeedback;
	}

	/**
	 * 3. 차트 데이터(history, prediction, subjectShare) 추출 메서드
	 */
	private Map<String, Object> getChartData(Long memberNum) {
		Map<String, Object> chartData = new HashMap<>();

		// DB에서 실제 history 데이터 조회
		List<Map<String, Object>> historyList = statisticsDao.selectHistoryStatistics(memberNum);
		System.out.println("historyList : " + historyList);
		chartData.put("history", historyList);

		Map<String, Object> prediction = prediction_llm(memberNum);
		System.out.println("prediction : " + prediction);
		chartData.put("prediction", prediction);

		// (3) DB에서 실제 subjectShare 데이터 조회
		List<Map<String, Object>> subjectShareList = statisticsDao.selectSubjectShareStatistics(memberNum);
		System.out.println("subjectShareList : " + subjectShareList);
		chartData.put("subjectShare", subjectShareList);

		return chartData;
	}

	private Map<String, Object> prediction_llm(Long memberNum) {
		// 카테고리별 통계점수
		List<Map<String, Object>> categoryStatsList = statisticsDao.selectCategoryStatisticsList(memberNum);

		// llm에 사용되어야함
		/*
		 * chartData.put("prediction", predictionList); prediction: [ {name: '최근
		 * 평균',score: 63.7, type: 'actual' }, {name: '다음 시험 예측', score: 82.0,
		 * type:'predict' }, ]
		 */
		RestTemplate restTemplate = new RestTemplate();
		return restTemplate.postForObject(fastapiUrl + "/prediction", categoryStatsList, Map.class);
	}
	
}
