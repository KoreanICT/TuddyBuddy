package kr.co.ictedu.back.common.vo;

import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Component
@Getter
@Setter
public class PageVO {
	private int nowPage; // 현재 페이지 값 -> 메뉴페이지와 연동되는 변수
	private int nowBlock; // 현재 블럭 -> [][][][] -> 1block
	private int totalRecord; // 총 게시물 수 .Dao로 부터 받음 -> select count(*)
	private int pagePerBlock; // 한 블락당 보여질 페이지의 블럭수
	private int numPerPage; // 한 페이지당 보여질 게시물 수
	private int totalPage; // 전체 페이지 수 => totalRecord/numPerPage
	private int totalBlock; // 전체 블럭 수
	private int beginPerPage; //  각 페이지별 시작 게시물의 index
	private int endPerPage; // 각 페이지별 마지막 게시물의 index
	public PageVO() {
		this.nowPage = 1;
		this.nowBlock = 1;
		this.numPerPage = 10;
		this.pagePerBlock = 5;
		System.out.println("페이지 처리 객체가 생성되었습니다.");
	}
	private int startPage;
	private int endPage;
}

