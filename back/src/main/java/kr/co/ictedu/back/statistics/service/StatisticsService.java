//김진규
package kr.co.ictedu.back.statistics.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.statistics.dao.StatisticsDao;
import kr.co.ictedu.back.statistics.dto.PredictionDTO;
import kr.co.ictedu.back.statistics.dto.StatisticsDTO;
import kr.co.ictedu.back.statistics.client.StatisticsPythonApiClient;
import kr.co.ictedu.back.point.service.PointService;

@Service
public class StatisticsService {
	@Autowired
	private StatisticsDao statisticsDao;

	@Autowired
	private PointService pointService;

	@Autowired
	private StatisticsPythonApiClient statisticsPythonApiClient;

	public List<Map<String, Object>> selectCategories(Long memberNum) {
		//역할: 회원번호 null 검증
		validateMemberNum(memberNum);
		// 카테고리 추출
		//역할: 카테고리 조회 결과 null 검증
		List<Map<String, Object>> categories = validateCategories(statisticsDao.selectCategories_Statistics(memberNum));
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

		//역할: 차트와 LLM이 함께 사용하는 회차별 시험 이력 조회
		List<Map<String, Object>> historyList = validateHistoryList(
				statisticsDao.selectHistoryStatistics(memberNum));

		// (1) LLM 데이터(피드백) 추출 메서드 호출
		StatisticsDTO llmFeedback = getLlmFeedbackData(memberNum, historyList);
		System.out.println("llmFeedback데이터: " + llmFeedback);
		// (2) 차트 데이터 추출 메서드 호출
		Map<String, Object> chartData = getChartData(memberNum, historyList);
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
	private StatisticsDTO getLlmFeedbackData(Long memberNum, List<Map<String, Object>> historyList) {
		// (1) 모든 제출 결과에서 회원의 전체 카테고리 풀이 로그 조회
		//역할: 전체 카테고리 풀이 로그 목록 검증
		List<Map<String, Object>> quizLogs = validateQuizLogs(
				statisticsDao.selectQuizLogsByMember_Statistics(memberNum));

		// (2) FastAPI AnalyzeRequest 요청 Payload 구성
		Map<String, Object> requestPayload = new HashMap<>();
		requestPayload.put("user_id", memberNum);
		requestPayload.put("quiz_logs", quizLogs);
		requestPayload.put("category_scores", historyList);

		// (3) FastAPI의 카테고리별 피드백 응답 수신
		//역할: 카테고리별 LLM 응답과 필수 필드 검증
		StatisticsDTO llmFeedback = validateStatisticsFeedback(
				statisticsPythonApiClient.requestStatistics(requestPayload));

		System.out.println("카테고리별 평가분석 응답 수신: " + llmFeedback.getCategoryAnalyses().size());
		return llmFeedback;
	}

	/**
	 * 3. 차트 데이터(history, prediction, subjectShare) 추출 메서드
	 */
	private Map<String, Object> getChartData(Long memberNum, List<Map<String, Object>> historyList) {
		Map<String, Object> chartData = new HashMap<>();

		// DB에서 조회한 회차별 시험 이력을 차트 데이터로 재사용
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
		//역할: 카테고리별 통계 조회 결과 검증
		List<Map<String, Object>> categoryStatsList = validateCategoryStatsList(
				statisticsDao.selectCategoryStatisticsList(memberNum));

		// llm에 사용되어야함
		/*
		 * chartData.put("prediction", predictionList); prediction: [ {name: '최근
		 * 평균',score: 63.7, type: 'actual' }, {name: '다음 시험 예측', score: 82.0,
		 * type:'predict' }, ]
		 */
		//역할: 카테고리별 예측 LLM 응답 및 필수 필드 검증
		PredictionDTO llmFeedback = validatePredictionFeedback(
				statisticsPythonApiClient.requestPrediction(categoryStatsList));

		System.out.println("카테고리별 성적예측 응답 수신: " + llmFeedback.getCategoryPredictions().size());
		return llmFeedback;
	
	}

	//=========================== 검증 메서드 영역 ==============================
	
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

	//역할: 카테고리 조회 결과가 null인지 검증
	private List<Map<String, Object>> validateCategories(List<Map<String, Object>> categories) {
		if (categories == null) {
			throw new IllegalArgumentException("카테고리 조회 결과가 없습니다.");
		}
		return categories;
	}

	//역할: 전체 카테고리 풀이 로그 목록이 null이거나 비었는지 검증
	private List<Map<String, Object>> validateQuizLogs(List<Map<String, Object>> quizLogs) {
		if (quizLogs == null || quizLogs.isEmpty()) {
			throw new IllegalArgumentException("분석할 풀이 로그가 없습니다.");
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

	//역할: 카테고리별 통계 조회 결과가 null이거나 비었는지 검증
	private List<Map<String, Object>> validateCategoryStatsList(List<Map<String, Object>> categoryStatsList) {
		if (categoryStatsList == null || categoryStatsList.isEmpty()) {
			throw new IllegalArgumentException("예측할 카테고리별 통계가 없습니다.");
		}
		return categoryStatsList;
	}

	//역할: 평가분석 LLM의 카테고리별 응답 객체와 필수 필드를 검증
	private StatisticsDTO validateStatisticsFeedback(StatisticsDTO feedback) {
		if (feedback == null || feedback.getCategoryAnalyses() == null
				|| feedback.getCategoryAnalyses().isEmpty()) {
			throw new IllegalArgumentException("평가분석 LLM 응답 데이터가 올바르지 않습니다.");
		}
		for (StatisticsDTO.CategoryAnalysisDTO analysis : feedback.getCategoryAnalyses()) {
			if (analysis == null || analysis.getCategoryIds() == null || analysis.getCategoryIds().isEmpty()
					|| analysis.getCategoryName() == null || analysis.getCategoryName().isBlank()
					|| analysis.getMentorComment() == null || analysis.getMentorComment().isBlank()
					|| analysis.getWeaknesses() == null || analysis.getConsultingPath() == null
					|| analysis.getConsultingPath().size() != 3) {
				throw new IllegalArgumentException("카테고리별 평가분석 응답 필드가 올바르지 않습니다.");
			}
		}
		return feedback;
	}

	//역할: 성적 예측 LLM의 카테고리별 응답과 예측 항목을 검증
	private PredictionDTO validatePredictionFeedback(PredictionDTO feedback) {
		if (feedback == null || feedback.getCategoryPredictions() == null
				|| feedback.getCategoryPredictions().isEmpty()) {
			throw new IllegalArgumentException("성적 예측 LLM 응답 데이터가 올바르지 않습니다.");
		}
		
		for (PredictionDTO.CategoryPredictionDTO categoryPrediction : feedback.getCategoryPredictions()) {
			if (categoryPrediction == null || categoryPrediction.getCategoryIds() == null
					|| categoryPrediction.getCategoryIds().isEmpty()
					|| categoryPrediction.getCategoryName() == null || categoryPrediction.getCategoryName().isBlank()
					|| categoryPrediction.getMentorComment() == null || categoryPrediction.getMentorComment().isBlank()
					|| categoryPrediction.getPrediction() == null || categoryPrediction.getPrediction().size() != 2) {
				throw new IllegalArgumentException("카테고리별 성적 예측 응답 필드가 올바르지 않습니다.");
			}
			List<PredictionDTO.PredictionItemDTO> items = categoryPrediction.getPrediction();
			if (items.get(0) == null || items.get(1) == null
					|| !"최근 평균".equals(items.get(0).getName())
					|| !"actual".equals(items.get(0).getType())
					|| !"다음 시험 예측".equals(items.get(1).getName())
					|| !"predict".equals(items.get(1).getType())) {
				throw new IllegalArgumentException("성적 예측 항목 순서 또는 유형이 올바르지 않습니다.");
			}
			for (PredictionDTO.PredictionItemDTO item : items) {
				if (item == null || item.getName() == null || item.getScore() == null
						|| item.getScore() < 0 || item.getScore() > 100 || item.getType() == null) {
					throw new IllegalArgumentException("성적 예측 항목이 올바르지 않습니다.");
				}
			}
		}
		return feedback;
	}
	
}
