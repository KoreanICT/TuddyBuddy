package kr.co.ictedu.back.statistics.client;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import kr.co.ictedu.back.statistics.dto.PredictionDTO;
import kr.co.ictedu.back.statistics.dto.StatisticsDTO;

/** 평가분석 도메인의 FastAPI 통신만 담당한다. */
@Component
public class StatisticsPythonApiClient {

	private final String fastapiUrl;
	private final RestTemplate restTemplate = new RestTemplate();

	public StatisticsPythonApiClient(@Value("${fastapi.url}") String fastapiUrl) {
		this.fastapiUrl = fastapiUrl;
	}

	public StatisticsDTO requestStatistics(Map<String, Object> requestPayload) {
		return restTemplate.postForObject(
				fastapiUrl + "/statistics", requestPayload, StatisticsDTO.class);
	}

	public PredictionDTO requestPrediction(List<Map<String, Object>> categoryStatsList) {
		return restTemplate.postForObject(
				fastapiUrl + "/prediction", categoryStatsList, PredictionDTO.class);
	}
}
