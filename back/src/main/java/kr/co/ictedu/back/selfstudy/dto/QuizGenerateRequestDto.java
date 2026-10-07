package kr.co.ictedu.back.selfstudy.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class QuizGenerateRequestDto {

    private Long subject_id;
    private Long member_num;

    private String quiz_type;
    private String quiz_difficulty;

    private Integer quiz_count;
    private String quiz_prompt;

    @ToString.Exclude
    private MultipartFile file;
}