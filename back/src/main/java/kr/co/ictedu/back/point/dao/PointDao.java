package kr.co.ictedu.back.point.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.point.vo.PointVO;

@Mapper
public interface PointDao {
	
	//n번 회원의 기존 포인트 조회 - member테이블
	Long select_point(Long num);
	
	//n번 회원의 모든 포인트 로그를 조회 - point테이블
	List<PointVO> select_point_log(Long num);
	
	//포인트로그 insert - point테이블
	void insertPoint(PointVO vo);
	
/*
	PointDao사용간 주의사항
	
	1. 포인트는 반드시 insert만 일어납니다 (delete,update없음)
	   계산방식 : 기존포인트 + 이벤트발생 포인트 = 최신포인트 > Point테이블 BALANCE_BEFORE,BALANCE_AFTER컬럼 참조
	2. Point테이블은 로그만 찍고 실질적인 Point저장 장소는 Member테이블 입니다
	3. 추가를 원하는 sql문있으면 디코방에 건의
	

	POINT_NUM NUMBER GENERATED ALWAYS AS IDENTITY   --  PK
	MEMBER_NUM NUMBER(10) NOT NULL,					-- FK(member)
	AMOUNT NUMBER(10) NOT NULL, 					-- 이번 이벤트로 변동할 포인트 
	BALANCE_BEFORE NUMBER(10) NOT NULL, 			-- 변동 전 포인트 잔액
	BALANCE_AFTER NUMBER(10) NOT NULL, 				-- 변동 후 포인트 잔액
	PAYMENT_PRICE NUMBER(10) DEFAULT 0 NOT NULL, 	-- 실제 결제/충전 금액
	POINT_TYPE VARCHAR2(20) NOT NULL,  				--체크 제약조건 참조
	DESCRIPTION VARCHAR2(200),  					--이벤트 주석 ex) 최초가입 포인트, 추천인등록 포인트, 결제 포인트, llm사용에 따른 포인트 차감 등등
	REGDATE DATE DEFAULT SYSDATE,  					--이벤트가 발생한 시점(날자)

	CONSTRAINT PK_POINT PRIMARY KEY (POINT_NUM)
	);
	
	체크 제약조건
	
	ADD CONSTRAINT CK_POINT_TYPE 
	CHECK (POINT_TYPE IN (
		'INIT',     --최초 가입/계정 생성 시
		'PAYMENT',  --결제/이벤트/적립금 지급
		'REFUND',   --결제 취소/환불로 인한 포인트 복구
		'USE',      --상품/서비스 구매 시 포인트 사용
		'ADMIN',    --관리자 강제 조정 (오류 수정, CS 처리 등)
		'CANCEL',   --포인트 사용/적립 건 취소
		'EXPIRE'	--유효기간 만료 소멸
	));
  
*/
}
