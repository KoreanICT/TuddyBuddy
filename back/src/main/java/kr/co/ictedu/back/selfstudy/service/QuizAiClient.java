//최솔
package kr.co.ictedu.back.selfstudy.service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.*;
import kr.co.ictedu.back.selfstudy.dto.AiQuizResponseDto;
import kr.co.ictedu.back.selfstudy.dto.QuizGenerateRequestDto;
import tools.jackson.databind.json.JsonMapper;

@Component
public class QuizAiClient {
	private final RestClient client;
	private final String token;
	private final JsonMapper json;

	public QuizAiClient(@Value("${quiz.ai.base-url}") String baseUrl, @Value("${quiz.ai.token:}") String token,
			@Value("${quiz.ai.timeout-seconds:180}") int timeout, JsonMapper json) {
		this.token = token;
		this.json = json;
		var factory = new SimpleClientHttpRequestFactory();
		factory.setConnectTimeout(Duration.ofSeconds(10));
		factory.setReadTimeout(Duration.ofSeconds(timeout));
		client = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
	}

	public AiQuizResponseDto classify(QuizGenerateRequestDto r, byte[] image, List<Map<String, Object>> catalog) {
		var parts = imageParts(r, image, catalog);
		try {
			var response = request("/api/ai/classify", parts).body(AiQuizResponseDto.class);
			if (response == null || blank(response.categoryName()) || blank(response.subjectName()))
				throw new ResponseStatusException(BAD_GATEWAY, "AI 분류 응답이 올바르지 않습니다.");
			return response;
		} catch (RestClientException e) {
			throw new ResponseStatusException(BAD_GATEWAY, "AI 서버 분류 요청에 실패했습니다. 서버 주소, API 키, 실행 상태를 확인해주세요.", e);
		}
	}

	public AiQuizResponseDto generate(QuizGenerateRequestDto r, byte[] image,
			List<Map<String, Object>> catalog, String categoryName, String subjectName) {
		var parts = imageParts(r, image, catalog);
		parts.add("category_name", categoryName);
		parts.add("subject_name", subjectName);
		try {
			var response = request("/api/ai/generate-quiz", parts).body(AiQuizResponseDto.class);
			validate(response, r);
			return response;
		} catch (RestClientException e) {
			throw new ResponseStatusException(BAD_GATEWAY, "AI 서버 호출에 실패했습니다. 서버 주소, API 키, 실행 상태를 확인해주세요.", e);
		}
	}

	private LinkedMultiValueMap<String, Object> imageParts(QuizGenerateRequestDto r, byte[] image,
			List<Map<String, Object>> catalog) {
		var parts = new LinkedMultiValueMap<String, Object>();
		var headers = new org.springframework.http.HttpHeaders();
		headers.setContentType(MediaType.parseMediaType(r.getFile().getContentType()));
		parts.add("file", new org.springframework.http.HttpEntity<>(new ByteArrayResource(image) {
			@Override
			public String getFilename() {
				return "image";
			}
		}, headers));
		if (r.getSubject_id() != null) {
			parts.add("subject_id", r.getSubject_id().toString());
		}
		parts.add("catalog_json", json.writeValueAsString(catalog));
		if (r.getQuiz_type() != null) parts.add("quiz_type", r.getQuiz_type());
		if (r.getQuiz_difficulty() != null) parts.add("quiz_difficulty", r.getQuiz_difficulty());
		if (r.getQuiz_count() != null) parts.add("quiz_count", r.getQuiz_count().toString());
		parts.add("quiz_prompt", r.getQuiz_prompt() == null ? "" : r.getQuiz_prompt());
		return parts;
	}

	private RestClient.ResponseSpec request(String uri, LinkedMultiValueMap<String, Object> parts) {
		var request = client.post().uri(uri).contentType(MediaType.MULTIPART_FORM_DATA);
		if (!token.isBlank()) request.header("X-AI-Token", token);
		return request.body(parts).retrieve();
	}

	private void validate(AiQuizResponseDto response, QuizGenerateRequestDto r) {
		if (response == null || blank(response.categoryName()) || blank(response.subjectName()))
			throw new ResponseStatusException(BAD_GATEWAY, "AI 응답에서 카테고리 또는 과목 분류를 받지 못했습니다.");
		if (response.quizzes() == null) return;
		for (var q : response.quizzes()) {
			if (q == null || blank(q.quizQuestion()) || blank(q.quizCorrectAnswer()) || blank(q.quizExplanation())
					|| q.quizSelections() == null || q.quizSelections().stream().anyMatch(this::blank))
				throw new ResponseStatusException(BAD_GATEWAY, "AI 문제 응답 형식이 올바르지 않습니다.");
			List<String> choices = q.quizSelections();
			boolean valid = switch (r.getQuiz_type()) {
			case "MULTIPLE_CHOICE" ->
				choices.size() == 4 && Set.copyOf(choices).size() == 4 && choices.contains(q.quizCorrectAnswer());
			case "OX" -> choices.size() == 2 && Set.copyOf(choices).equals(Set.of("O", "X"))
					&& choices.contains(q.quizCorrectAnswer());
			case "SHORT_ANSWER" -> choices.isEmpty();
			default -> false;
			};
			if (!valid)
				throw new ResponseStatusException(BAD_GATEWAY, "AI 보기와 정답이 일치하지 않습니다.");
		}
	}

	private boolean blank(String value) {
		return value == null || value.isBlank();
	}
}
