package kr.co.ictedu.back.chatbot.service;

import java.net.http.HttpClient;

import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
// Spring Boot에서 다른 HTTP 서버/API를 호출하기 위한 도구
import org.springframework.web.client.RestClient;

import kr.co.ictedu.back.chatbot.dto.ChatAIRequest;
import kr.co.ictedu.back.chatbot.dto.ChatAIResponse;
import kr.co.ictedu.back.chatbot.dto.ChatFastAPIRequest;


// FastAPI 통신

@Service
public class ChatAIService {

	private RestClient restClient;
	
    public ChatAIService() {
    	// HTTP/1.1 방식의 HttpClient 생성
    	HttpClient httpClient = HttpClient.newBuilder()
    			.version(HttpClient.Version.HTTP_1_1)	// HTTP 버전을 1.1로 지정
    			.build();								// HttpClient 객체 생성
    	
    	// HttpClient를 Spring RestClient에서 사용할 수 있도록 연결
    	JdkClientHttpRequestFactory requestFactory = 
    			new JdkClientHttpRequestFactory(httpClient);
    	
        this.restClient = RestClient.builder()
        		.baseUrl("http://192.168.0.72:8000") // 나중에 application.properties에 분리하기
        		.requestFactory(requestFactory)
        		.build();
    }
	

	// FastAPI에 질문을 전달하고 AI 응답 반환
	public ChatAIResponse askAI(ChatAIRequest request) {
		
		// FastAPI에 전달할 데이터 생성
		ChatFastAPIRequest fastAPIRequest = 
				new ChatFastAPIRequest(
						request.getQuestion(),
						request.getUser_type()
				);
				
		return restClient.post()						// POST 요청
				.uri("/chat") 							// 요청 주소 (http://192.168.0.72:8000/chat)
				.contentType(MediaType.APPLICATION_JSON)// 요청 데이터 형식을 JSON으로 지정
				.body(fastAPIRequest)							// Java 객체 -> 요청 Body(JSON)
				.retrieve()								// HTTP 응답 처리
				.body(ChatAIResponse.class);			// 응답 Body(JSON) -> Java 객체
	}
}
