package kr.co.ictedu.back.selfstudy.service;

import java.time.Duration;
import java.util.List;
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

@Component
public class QuizAiClient {
    private final RestClient client;
    private final String token;
    public QuizAiClient(@Value("${quiz.ai.base-url}") String baseUrl,
            @Value("${quiz.ai.token:}") String token,
            @Value("${quiz.ai.timeout-seconds:180}") int timeout) {
        this.token = token;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(timeout));
        client = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }
    public AiQuizResponseDto generate(QuizGenerateRequestDto r, byte[] image) {
        var parts = new LinkedMultiValueMap<String, Object>();
        var headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(r.getFile().getContentType()));
        parts.add("file", new org.springframework.http.HttpEntity<>(new ByteArrayResource(image) {
            @Override public String getFilename() { return "image"; }
        }, headers));
        parts.add("subject_id", r.getSubject_id().toString());
        parts.add("quiz_type", r.getQuiz_type());
        parts.add("quiz_difficulty", r.getQuiz_difficulty());
        parts.add("quiz_count", r.getQuiz_count().toString());
        parts.add("quiz_prompt", r.getQuiz_prompt() == null ? "" : r.getQuiz_prompt());
        try {
            var request = client.post().uri("/api/ai/generate-quiz")
                .contentType(MediaType.MULTIPART_FORM_DATA);
            if (!token.isBlank()) request.header("X-AI-Token", token);
            var response = request.body(parts).retrieve().body(AiQuizResponseDto.class);
            validate(response, r);
            return response;
        } catch (RestClientException e) {
            throw new ResponseStatusException(BAD_GATEWAY,
                "AI 서버 호출에 실패했습니다. 서버 주소, API 키, 실행 상태를 확인해주세요.", e);
        }
    }
    private void validate(AiQuizResponseDto response, QuizGenerateRequestDto r) {
        if (response == null || response.quizzes() == null || response.quizzes().size() != r.getQuiz_count())
            throw new ResponseStatusException(BAD_GATEWAY, "AI가 요청한 수의 문제를 반환하지 않았습니다.");
        for (var q : response.quizzes()) {
            if (q == null || blank(q.quizQuestion()) || blank(q.quizCorrectAnswer()) || blank(q.quizExplanation())
                    || q.quizSelections() == null || q.quizSelections().stream().anyMatch(this::blank))
                throw new ResponseStatusException(BAD_GATEWAY, "AI 문제 응답 형식이 올바르지 않습니다.");
            List<String> choices = q.quizSelections();
            boolean valid = switch (r.getQuiz_type()) {
                case "MULTIPLE_CHOICE" -> choices.size() == 4 && Set.copyOf(choices).size() == 4 && choices.contains(q.quizCorrectAnswer());
                case "OX" -> choices.size() == 2 && Set.copyOf(choices).equals(Set.of("O", "X")) && choices.contains(q.quizCorrectAnswer());
                case "SHORT_ANSWER" -> choices.isEmpty();
                default -> false;
            };
            if (!valid) throw new ResponseStatusException(BAD_GATEWAY, "AI 보기와 정답이 일치하지 않습니다.");
        }
    }
    private boolean blank(String value) { return value == null || value.isBlank(); }
}
