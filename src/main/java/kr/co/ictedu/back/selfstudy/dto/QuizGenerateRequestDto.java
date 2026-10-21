//최솔
package kr.co.ictedu.back.selfstudy.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Schema(description = "QuizGenerateRequestDto 데이터")
public class QuizGenerateRequestDto {

    @Schema(description = "기존 과목 번호 (자동 분류 시 생략 가능)", example = "1")
    private Long subject_id;
    @Schema(description = "회원 번호", example = "1")
    private Long member_num;

    @Schema(description = "문제 유형", example = "객관식")
    private String quiz_type;
    @Schema(description = "문제 난이도", example = "중")
    private String quiz_difficulty;

    @Schema(description = "생성할 문제 수", example = "5")
    private Integer quiz_count;
    @Schema(description = "문제 생성 추가 요청사항", example = "자바 기초 개념을 중심으로 출제해주세요")
    private String quiz_prompt;

    @ToString.Exclude
    @Schema(description = "문제 생성용 첨부 파일", example = "quiz.pdf")
    private MultipartFile file;
}
