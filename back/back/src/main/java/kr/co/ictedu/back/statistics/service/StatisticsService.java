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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import io.swagger.v3.oas.models.PathItem.HttpMethod;
import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
import kr.co.ictedu.back.statistics.dao.StatisticsDao;
import kr.co.ictedu.back.statistics.dto.PredictionDTO;
import kr.co.ictedu.back.statistics.dto.StatisticsDTO;
import kr.co.ictedu.back.point.service.PointService;

@Service
public class StatisticsService {
	// 1. @Autowired를 이용한 필드 주입 방식 적용
	@Autowired
	private SelfStudyDao selfStudyDao;

	@Autowired
	private StatisticsDao statisticsDao;

	@Autowired
	private PointService pointService;

	@Value("${fastapi.url}")
	private String fastapiUrl;

	public List<String> selectCategories(Long memberNum) {
		//역할: 회원번호 null 검증
		validateMemberNum(memberNum);
		// 카테고리 추출
		//역할: 카테고리 조회 결과 null 검증
		List<String> categories = validateCategories(statisticsDao.selectCategories_Statistics(memberNum));
		return categories;
	}

	/**
	 * 1. 최종 통합 통계 데이터 조회 (컨트롤러에서 호출하는 메인 메서드)
	 */
	@Transactional
	public Map<String, Object> selectStatistics(Long memberNum, String description) {
		//역할: 회원번호 null 검증
		validateMemberNum(memberNum);
		//역할: 포인트 차감 설명 null 검증
		validateDescription(description);
		// 분석이 정상 완료되지 않으면 포인트 차감과 로그도 함께 롤백한다.
		pointService.usePoint(memberNum, 1_000L, description);

		// (1) LLM 데이터(피드백) 추출 메서드 호출
		StatisticsDTO llmFeedback = getLlmFeedbackData(memberNum);
		System.out.println("llmFeedback데이터: " + llmFeedback);
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
	private StatisticsDTO getLlmFeedbackData(Long memberNum) {
		// (1) 세션 ID 추출
		//역할: 세션 조회 결과 null 검증
		Long sessionId = validateSessionId(statisticsDao.selectSessionId_Statistics(memberNum));

		// (2) 학습 결과 단건 조회 (결과 존재 여부 검증 및 selfstudy_results_id 확보용)
		//역할: 학습 결과 조회 결과 null 검증
		SelfStudyResultVO result = validateStudyResult(statisticsDao.selectResult(sessionId));
		//역할: 학습 결과 ID null 검증
		Long resultId = validateResultId(result.getSelfstudy_results_id());
		//역할: 학습 결과 회원번호 null 검증
		Long resultMemberNum = validateMemberNum(result.getMember_num());

		// (3) 최적화된 조인 쿼리를 통해 해당 결과의 오답 로그 목록을 곧바로 조회
		// (더미 데이터 기준으로 selfstudy_results_id를 전달하여 오답 'N'만 추출)
		//역할: 오답 로그 조회 결과 null 검증
		List<Map<String, Object>> quizLogs = validateQuizLogs(
				statisticsDao.selectIncorrectQuizzesByResultId_Statistics(resultId));

		// (4) FastAPI로 보낼 최종 요청 Payload(Body) 구성
		Map<String, Object> requestPayload = new HashMap<>();
		requestPayload.put("user_id", resultMemberNum);
		requestPayload.put("quiz_logs", quizLogs);

		// (5) RestTemplate을 통해 FastAPI 서버로 POST 요청 전송
		RestTemplate restTemplate = new RestTemplate();
		//역할: LLM 응답 및 필수 필드 null 검증
		StatisticsDTO llmFeedback = validateStatisticsFeedback(
				restTemplate.postForObject(fastapiUrl + "/statistics", requestPayload, StatisticsDTO.class));

		System.out.println("llm데이터 수신 성공: " + llmFeedback.getMentorComment());
		return llmFeedback;
	}

	/**
	 * 3. 차트 데이터(history, prediction, subjectShare) 추출 메서드
	 */
	private Map<String, Object> getChartData(Long memberNum) {
		Map<String, Object> chartData = new HashMap<>();

		// DB에서 실제 history 데이터 조회
		//역할: 히스토리 조회 결과 null 검증
		List<Map<String, Object>> historyList = validateHistoryList(statisticsDao.selectHistoryStatistics(memberNum));
		System.out.println("historyList : " + historyList);
		chartData.put("history", historyList);

		//llm평가분석 데이터 추출 및 조회
		PredictionDTO prediction = prediction_llm(memberNum);
		System.out.println("prediction : " + prediction);
		chartData.put("prediction", prediction);

		//DB에서 실제 subjectShare 데이터 조회
		//역할: 과목 비중 조회 결과 null 검증
		List<Map<String, Object>> subjectShareList = validateSubjectShareList(
				statisticsDao.selectSubjectShareStatistics(memberNum));
		System.out.println("subjectShareList : " + subjectShareList);
		chartData.put("subjectShare", subjectShareList);

		return chartData;
	}

	private PredictionDTO prediction_llm(Long memberNum) {
		// 카테고리별 통계점수
		//역할: 카테고리별 통계 조회 결과 null 검증
		List<Map<String, Object>> categoryStatsList = validateCategoryStatsList(
				statisticsDao.selectCategoryStatisticsList(memberNum));

		// llm에 사용되어야함
		/*
		 * chartData.put("prediction", predictionList); prediction: [ {name: '최근
		 * 평균',score: 63.7, type: 'actual' }, {name: '다음 시험 예측', score: 82.0,
		 * type:'predict' }, ]
		 */
		RestTemplate restTemplate = new RestTemplate();
		//역할: 예측 LLM 응답 및 필수 필드 null 검증
		PredictionDTO llmFeedback = validatePredictionFeedback(
				restTemplate.postForObject(fastapiUrl + "/prediction", categoryStatsList, PredictionDTO.class));

		System.out.println("llm데이터 수신 성공: " + llmFeedback.getMentorComment());
		return llmFeedback;
	
	}

	//역할: 회원번호 인자가 null인지 검증
	private Long validateMemberNum(Long memberNum) {
		if (memberNum == null || memberNum <= 0) {
			throw new IllegalArgumentException("올바른 회원 번호가 필요합니다.");
		}
		return memberNum;
	}

	//역할: 포인트 차감 설명이 null인지 검증
	private String validateDescription(String description) {
		if (description == null) {
			throw new IllegalArgumentException("포인트 차감 설명이 필요합니다.");
		}
		return description;
	}

	//역할: 회원의 세션 조회 결과가 null인지 검증
	private Long validateSessionId(Long sessionId) {
		if (sessionId == null) {
			throw new IllegalArgumentException("회원의 학습 세션을 찾을 수 없습니다.");
		}
		return sessionId;
	}

	//역할: 학습 결과 조회 결과가 null인지 검증
	private SelfStudyResultVO validateStudyResult(SelfStudyResultVO result) {
		if (result == null) {
			throw new IllegalArgumentException("존재하지 않는 학습 결과입니다.");
		}
		return result;
	}

	//역할: 학습 결과 ID가 null인지 검증
	private Long validateResultId(Long resultId) {
		if (resultId == null) {
			throw new IllegalArgumentException("학습 결과 번호가 없습니다.");
		}
		return resultId;
	}

	//역할: 카테고리 조회 결과가 null인지 검증
	private List<String> validateCategories(List<String> categories) {
		if (categories == null) {
			throw new IllegalArgumentException("카테고리 조회 결과가 없습니다.");
		}
		return categories;
	}

	//역할: 오답 로그 조회 결과가 null인지 검증
	private List<Map<String, Object>> validateQuizLogs(List<Map<String, Object>> quizLogs) {
		if (quizLogs == null) {
			throw new IllegalArgumentException("오답 로그 조회 결과가 없습니다.");
		}
		return quizLogs;
	}

	//역할: 히스토리 조회 결과가 null인지 검증
	private List<Map<String, Object>> validateHistoryList(List<Map<String, Object>> historyList) {
		if (historyList == null) {
			throw new IllegalArgumentException("성적 히스토리 조회 결과가 없습니다.");
		}
		return historyList;
	}

	//역할: 과목 비중 조회 결과가 null인지 검증
	private List<Map<String, Object>> validateSubjectShareList(List<Map<String, Object>> subjectShareList) {
		if (subjectShareList == null) {
			throw new IllegalArgumentException("과목 비중 조회 결과가 없습니다.");
		}
		return subjectShareList;
	}

	//역할: 카테고리별 통계 조회 결과가 null인지 검증
	private List<Map<String, Object>> validateCategoryStatsList(List<Map<String, Object>> categoryStatsList) {
		if (categoryStatsList == null) {
			throw new IllegalArgumentException("카테고리별 통계 조회 결과가 없습니다.");
		}
		return categoryStatsList;
	}

	//역할: 평가분석 LLM 응답 객체와 필수 필드가 null인지 검증
	private StatisticsDTO validateStatisticsFeedback(StatisticsDTO feedback) {
		if (feedback == null || feedback.getMentorComment() == null || feedback.getWeaknesses() == null
				|| feedback.getConsultingPath() == null) {
			throw new IllegalArgumentException("평가분석 LLM 응답 데이터가 올바르지 않습니다.");
		}
		return feedback;
	}

	//역할: 성적 예측 LLM 응답 객체와 예측 목록이 null인지 검증
	private PredictionDTO validatePredictionFeedback(PredictionDTO feedback) {
		if (feedback == null || feedback.getPrediction() == null) {
			throw new IllegalArgumentException("성적 예측 LLM 응답 데이터가 올바르지 않습니다.");
		}
		return feedback;
	}
	
}
