package kr.co.ictedu.back;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@EnableScheduling
@SpringBootApplication
public class BackApplication {

	@Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

	public static void main(String[] args) {
		SpringApplication.run(BackApplication.class, args);
	}
	// spring boot에서 비동기식 외부 접속[Cros Allow Origin]을 허용해주기 위한 설정
		// 빈으로 등록 - 스프링 컨테이너가 관리할 객체 <bean ~
		@Bean
		public WebMvcConfigurer crosConfigurer() {
			return new WebMvcConfigurer() {
				@Override
				public void addCorsMappings(CorsRegistry registry) {
					System.out.println("Cros Allow Origin 실행!");
					registry.addMapping("/**")
					.allowedOrigins(allowedOrigins)
					.allowCredentials(true)
					.allowedHeaders("*")
					.allowedMethods("*").maxAge(3600);
				}
			};
		}

}
