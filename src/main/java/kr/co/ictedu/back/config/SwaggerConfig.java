// 주용현

package kr.co.ictedu.back.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "TuddyBuddy API",
        version = "1.0.0",
        description = "AI 기반 학습 지원 웹 애플리케이션\n\n"
                + "그룹 스터디, 개인 학습 등 REST API 명세서",
        contact = @Contact(
            name = "TuddyBuddy 개발팀"
        )
    )
)
public class SwaggerConfig {

}