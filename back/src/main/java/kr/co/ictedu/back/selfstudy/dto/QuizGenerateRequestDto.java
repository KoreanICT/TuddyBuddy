package kr.co.ictedu.back.selfstudy.dto;

import org.springframework.web.multipart.MultipartFile;

public class QuizGenerateRequestDto {

    private Long subjectId;
    private Long memberNum;
    private String quizType;
    private String quizDifficulty;
    private Integer quizCount;
    private String quizPrompt;
    private MultipartFile file;
}
