//김진규
package kr.co.ictedu.back.point.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.point.dao.PointDao;
import kr.co.ictedu.back.point.vo.PointVO;

@Service
public class PointService {

	@Autowired
	private PointDao dao;

	public Long select_point(Long num) {
		return dao.select_point(num);
	}

	public void insertPoint(PointVO vo) {
		dao.insertPoint(vo);
	}

	/**
	 * 포인트 사용 처리. 호출하는 도메인에서 회원 번호, 사용할 포인트, 설명을 전달한다.
	 * 포인트 로그와 회원 잔액 변경은 하나의 트랜잭션으로 처리한다.
	 */
	@Transactional
	public void usePoint(Long memberNum, Long amount, String description) {
		validatePointRequest(memberNum, amount, description);

		//회원정보 검증 + 회원의 기존 point조회
		Long balanceBefore = dao.select_point_for_update(memberNum);
		if (balanceBefore == null) {
			throw new IllegalArgumentException("회원을 찾을 수 없습니다.");
		}
		
		//잔액부족 예외처리
		if (balanceBefore < amount) {
			throw new IllegalStateException("포인트 잔액이 부족합니다.");
		}

		//저장할 포인트 = 기존포인트 - 변동될 포인트
		long balanceAfter = balanceBefore - amount;
		if (dao.update_member_point(memberNum, balanceAfter) != 1) {
			throw new IllegalStateException("회원 포인트 잔액을 변경하지 못했습니다.");
		}

		insertPointChange(memberNum, -amount, balanceBefore, balanceAfter, 0L, "USE", description);
	}

	//추천인 코드 포인트 적립 메서드 : 1000 point로 고정
	@Transactional
	public void addReferralReward(String referralCode, String description) {
		if (referralCode == null || referralCode.isBlank()) {
			throw new IllegalArgumentException("추천인 코드를 입력해야 합니다.");
		}
		//point변동 전 무결성 검증
		validateDescription(description);
		
		//추천인 코드 검증
		Long memberNum = dao.select_member_num_by_code(referralCode.trim());
		if (memberNum == null) {
			throw new IllegalArgumentException("존재하지 않는 추천인 코드입니다.");
		}
		
		//회원 포인트 잔액 추출
		Long balanceBefore = dao.select_point_for_update(memberNum);
		if (balanceBefore == null) {
			throw new IllegalArgumentException("추천인 회원의 포인트 잔액을 찾을 수 없습니다.");
		}
		
		//추천인 코드 적립 포인트 1000
		long amount = 1_000L;
		long balanceAfter = balanceBefore + amount;
		if (dao.update_member_point(memberNum, balanceAfter) != 1) {
			throw new IllegalStateException("회원 포인트 잔액을 변경하지 못했습니다.");
		}
		//변동사항 insert 메서드에 전달
		insertPointChange(memberNum, amount, balanceBefore, balanceAfter, 0L, "SAVE", description);
	}
	
	//point변동 전 무결성 검증
	private void validatePointRequest(Long memberNum, Long amount, String description) {
		if (memberNum == null || memberNum <= 0) {
			throw new IllegalArgumentException("올바른 회원 번호가 필요합니다.");
		}
		if (amount == null || amount <= 0) {
			throw new IllegalArgumentException("사용 포인트는 0보다 커야 합니다.");
		}
		//point변동 코멘트 무결성 검증
		validateDescription(description);
	}
	
	//point변동 코멘트 무결성 검증
	private void validateDescription(String description) {
		if (description == null || description.length() > 200) {
			throw new IllegalArgumentException("설명은 필수이며 200자를 초과할 수 없습니다.");
		}
	}
	
	//변동사항 insert 메서드
	private void insertPointChange(Long memberNum, Long amount, Long balanceBefore, Long balanceAfter,
			Long paymentPrice, String pointType, String description) {
		PointVO vo = new PointVO();
		vo.setMember_num(memberNum);
		vo.setAmount(amount);
		vo.setBalance_before(balanceBefore);
		vo.setBalance_after(balanceAfter);
		vo.setPayment_price(paymentPrice);
		vo.setPoint_type(pointType);
		vo.setDescription(description);
		//최종 insert 메서드
		dao.insertPoint(vo);
	}

	//결제 메서드
	@Transactional 
	public void payment(Map<String, Object> paymentMap) {
	    //파라미터 받아줄 맵 선언
		Map<String, Object> innerPayment = (Map<String, Object>) paymentMap.get("payment");
	    //맵에서 필요한 요소들 분리
		Long porintNum = ((Number) innerPayment.get("porint")).longValue();
	    Long priceNum = ((Number) innerPayment.get("price")).longValue();
	    String description = (String) paymentMap.get("description");
	    String point_type = (String) paymentMap.get("point_type"); //PAYMENT
	    
	    //더미데이터 수정 필요 >  세션에서 member_num구할수 있게되면 추가 처리
	    int num = 1;
	    Long balance_before = select_point(Long.valueOf(num));
	    //-------------------------------------------------------
	    
	    // 저장할 포인트 = 기존포인트 + 변동될 포인트
	    Long balance_after = balance_before + porintNum;
	    
	    // 변동사항 insert 메서드에 전달
	    insertPointChange(Long.valueOf(num), porintNum, balance_before, balance_after,
		    priceNum, point_type, description);
	}
	
}
