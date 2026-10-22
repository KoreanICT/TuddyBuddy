package kr.co.ictedu.back.common.vo;

import org.springframework.stereotype.Component;
import lombok.Getter;
import lombok.Setter;

@Component
@Getter
@Setter
public class CommunityVO {

	private int id; // 커뮤니티 페이지 게시글 번호
	private int title; // 커뮤니티 페이지 게시글 제목
	private int content; // 커뮤니티 페이지 게시글 내용
	private int nickname; // 사용자 닉네임
	private int category; // 커뮤니티 페이지 게시글 카테고리
}
