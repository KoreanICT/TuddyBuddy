package kr.co.ictedu.back.selfstudy.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class QuizResponseDto {

	private Long quiz_id;
	 private String quiz_user_response;
}