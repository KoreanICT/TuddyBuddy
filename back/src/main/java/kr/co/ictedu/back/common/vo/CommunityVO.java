package kr.co.ictedu.back.common.vo;

import java.util.Date;

import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Component
@Getter
@Setter
public class CommunityVO {

	private int id; // 커뮤니티 페이지 게시글 번호
	private String title; // 커뮤니티 페이지 게시글 제목
	private String content; // 커뮤니티 페이지 게시글 내용
	private int commentNum; // 댓글 수
	private String nickname; // 사용자 닉네임
	private String category; // 커뮤니티 페이지 게시글 카테고리
	private int likeCount; // 좋아요 개수
	private Date communityDate; // 게시글 작성일
	private int viewCount; // 게시글 조회수
}