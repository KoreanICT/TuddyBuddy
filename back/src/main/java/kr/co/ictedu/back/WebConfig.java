package kr.co.ictedu.back;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 1. 팀원들이 기존에 사용하던 임시 파일 / 멀티파트 업로드 경로
    @Value("${spring.servlet.multipart.location}")
    private String uploadPath;

    // 2. 그룹 썸네일 전용 외부 업로드 경로
    @Value("${file.upload.group-thumbnail}")
    private String thumbnailUploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 기존 팀원들이 사용하던 /imgfile/** 경로 매핑 유지
        String multipartPath = "file:" + uploadPath.replace("\\", "/") + "/";
        registry.addResourceHandler("/imgfile/**")
                .addResourceLocations(multipartPath);

        // 새로 추가된 그룹 썸네일 /api/group/thumbnail/** 경로 매핑
        String thumbnailPath = "file:///" + thumbnailUploadPath.replace("\\", "/") + "/";
        registry.addResourceHandler("/api/group/thumbnail/**")
                .addResourceLocations(thumbnailPath);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "http://192.168.0.19:3000"
                )
                .allowedMethods(
                        "GET", "POST", "PUT", "PATCH",
                        "DELETE", "OPTIONS"
                )
                .allowedHeaders("*");
    }
}