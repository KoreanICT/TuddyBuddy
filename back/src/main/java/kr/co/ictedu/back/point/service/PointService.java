//김진규
package kr.co.ictedu.back.point.service;

import java.util.Map;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.point.dao.PointDao;
import kr.co.ictedu.back.point.vo.PointVO;

@Service
public class PointService {
    public static final long ATTENDANCE_REWARD = 300L;

	//포인트타임 : 체크 제약조건 검증용 리스트
	private static final List<String> VALID_POINT_TYPES = List.of(
			"INIT", "PAYMENT", "REFUND", "USE", "ADMIN", "CANCEL", "EXPIRE");

	@Autowired
	private PointDao dao;

	/**
	 * 회원번호에 해당하는 전체 포인트 로그를 한 번 조회한다.
	 * 결과에는 변동일, 변동 포인트, 변동 후 잔액, 변동 사유가 포함된다.
	 */
	public List<PointVO> selectPointHistory(Long memberNum) {
		//역할: 회원번호 검증
		validateMemberNumber(memberNum);
		return dao.select_point_log(memberNum);
	}

	/** 출석 보상 포인트 300점을 적립한다. */
	@Transactional
	public void addAttendanceReward(Long memberNum, String description) {
		//역할: 출석 보상을 받을 회원번호 검증
		validateMemberNumber(memberNum);
		//역할: 출석 보상 설명 검증
		validateDescription(description);
		long amount = ATTENDANCE_REWARD;
		//역할: 출석 보상 포인트 양수 검증
		validatePositiveAmount(amount, "출석 보상 포인트");
		insertPointChange(memberNum, amount, 0L, "PAYMENT", description);
	}

	/**
	 * 포인트 사용 처리. 호출하는 도메인에서 회원 번호, 사용할 포인트, 설명을 전달한다.
	 * 포인트 로그와 회원 잔액 변경은 하나의 트랜잭션으로 처리한다.
	 */
	@Transactional
	public void usePoint(Long memberNum, Long amount, String description) {
		//역할: 회원번호 검증
		validateMemberNumber(memberNum);
		//역할: 설명 검증
		validateDescription(description);
		//역할: 사용 포인트 양수 검증
		validatePositiveAmount(amount, "사용 포인트");
		insertPointChange(memberNum, -amount, 0L, "USE", description);
	}

	//추천인 코드 포인트 적립 메서드 : 1000 point로 고정
	@Transactional
	public void addReferralReward(String referralCode, String description) {
		long amount;
		//역할: 추천인 코드가 미입력인지 확인하고 입력된 코드를 정규화
		referralCode = validateReferralCode(referralCode);
		//역할: 미입력이면 조회 없이, 입력된 코드는 회원 조회 결과를 검증
		Long memberNum = validateReferralMemberNumber(
				referralCode == null ? null : dao.select_member_num_by_code(referralCode), referralCode);
		if (memberNum == null) {
			amount = 0L;
			return;
		}
		//역할: 설명 검증
		validateDescription(description);
		//역할: 추천인 회원번호 검증
		validateMemberNumber(memberNum);

		//추천인 코드 적립 포인트 1000
		amount = 1_000L;
		//역할: 추천 보상 포인트 양수 검증
		validatePositiveAmount(amount, "추천 보상 포인트");
		insertPointChange(memberNum, amount, 0L, "PAYMENT", description);
	}
	
	//회원 잔액 갱신과 포인트 변경 로그 INSERT를 한 트랜잭션 안에서 처리
	private void insertPointChange(Long memberNum, Long amount, Long paymentPrice, String pointType,
			String description) {
		//역할: POINT_TYPE이 DB 체크 제약조건의 허용 값인지 검증
		pointType = validatePointType(pointType);
		Long balanceBefore = dao.select_point_for_update(memberNum);
		//역할: 회원 잔액 조회 성공 여부 검증
		validateMemberBalance(balanceBefore);
		//역할: 변경 후 잔액 계산과 부족 잔액 검증
		long balanceAfter = validateBalanceAfter(balanceBefore, amount);
		//역할: 회원 잔액 UPDATE 성공 여부 검증
		validateBalanceUpdateCount(dao.update_member_point(memberNum, balanceAfter));

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
		//역할: 결제 요청 null 검증
		validatePaymentMap(paymentMap);
		Object paymentObject = paymentMap.get("payment");
		//역할: 결제 상품 Map 타입 검증
		Map<?, ?> innerPayment = validatePaymentDetails(paymentObject);

		//역할: 충전 포인트 숫자 타입 검증 및 값 추출
		Long pointAmount = validateNumber(innerPayment.get("porint"), "충전 포인트").longValue();
		//역할: 결제 금액 숫자 타입 검증 및 값 추출
		Long paymentPrice = validateNumber(innerPayment.get("price"), "결제 금액").longValue();
		//역할: 결제 요청의 회원번호 숫자 타입 검증 및 값 추출
		Long memberNum = validateNumber(innerPayment.get("memberNum"), "회원 번호").longValue();
		//역할: 설명 문자열 타입 검증 및 값 추출
		String description = validateString(paymentMap.get("description"), "설명");
		//역할: 포인트 유형 문자열 타입 검증 및 값 추출
		String pointType = validateString(paymentMap.get("point_type"), "포인트 유형");

		//역할: 회원번호 검증
		validateMemberNumber(memberNum);
		//역할: 설명 값 검증
		validateDescription(description);
		//역할: 충전 포인트 양수 검증
		validatePositiveAmount(pointAmount, "충전 포인트");
		//역할: 결제 금액 검증
		validatePaymentPrice(paymentPrice);

		insertPointChange(memberNum, pointAmount, paymentPrice, pointType, description);
	}
	
	
	//=========================== 검증 메서드 영역 ==============================
	

	//역할: 결제 요청 Map이 null인지 검증
	private void validatePaymentMap(Map<String, Object> paymentMap) {
		if (paymentMap == null) {
			throw new IllegalArgumentException("결제 데이터가 필요합니다.");
		}
	}

	//역할: 회원번호가 null 또는 유효하지 않은 값인지 검증
	private void validateMemberNumber(Long memberNum) {
		if (memberNum == null || memberNum <= 0) {
			throw new IllegalArgumentException("올바른 회원 번호가 필요합니다.");
		}
	}

	//역할: 설명이 null, 공백 또는 컬럼 길이 초과인지 검증
	private void validateDescription(String description) {
		if (description == null || description.isBlank() || description.length() > 200) {
			throw new IllegalArgumentException("설명은 필수이며 200자를 초과할 수 없습니다.");
		}
	}

	//역할: 금액이 null 또는 0 이하인지 검증
	private void validatePositiveAmount(Long amount, String fieldName) {
		if (amount == null || amount <= 0) {
			throw new IllegalArgumentException(fieldName + "는 0보다 커야 합니다.");
		}
	}

	//역할: POINT_TYPE이 DB 체크 제약조건의 허용 값인지 검증
	private String validatePointType(String pointType) {
		if (pointType == null || !VALID_POINT_TYPES.contains(pointType)) {
			throw new IllegalArgumentException("올바르지 않은 포인트 유형입니다.");
		}
		return pointType;
	}

	//역할: 결제 금액이 null 또는 음수인지 검증
	private Long validatePaymentPrice(Long paymentPrice) {
		Long validatedPaymentPrice = paymentPrice == null ? 0L : paymentPrice;
		if (validatedPaymentPrice < 0) {
			throw new IllegalArgumentException("결제 금액은 0 이상이어야 합니다.");
		}
		return validatedPaymentPrice;
	}

	//역할: 추천인 코드 미입력은 보상 없이 종료하고, 입력된 코드는 회원 조회 결과와 일치하는지 검증
	private Long validateReferralMemberNumber(Long memberNum, String referralCode) {
		if (referralCode == null) {
			return null;
		} else if (memberNum == null) {
			throw new IllegalArgumentException("존재하지 않는 추천인 코드입니다.");
		}
		return memberNum;
	}

	// 선택 입력이므로 null·빈 문자열·공백은 모두 추천인 없음으로 처리합니다.
	private String validateReferralCode(String referralCode) {
		if (referralCode == null || referralCode.isBlank()) {
			return null;
		}
		return referralCode.trim();
	}

	//역할: 결제 요청의 내부 상품 데이터가 Map인지 검증
	private Map<?, ?> validatePaymentDetails(Object paymentObject) {
		if (!(paymentObject instanceof Map<?, ?> innerPayment)) {
			throw new IllegalArgumentException("결제 상품 데이터가 올바르지 않습니다.");
		}
		return innerPayment;
	}

	//역할: 외부 Map 값이 숫자인지 검증
	private Number validateNumber(Object value, String fieldName) {
		if (!(value instanceof Number number)) {
			throw new IllegalArgumentException(fieldName + " 값은 숫자여야 합니다.");
		}
		return number;
	}

	//역할: 외부 Map 값이 문자열인지 검증
	private String validateString(Object value, String fieldName) {
		if (!(value instanceof String text)) {
			throw new IllegalArgumentException(fieldName + " 값은 문자열이어야 합니다.");
		}
		return text;
	}

	//역할: 회원 잔액 조회 결과가 null인지 검증
	private void validateMemberBalance(Long balance) {
		if (balance == null) {
			throw new IllegalArgumentException("회원 포인트 잔액을 찾을 수 없습니다.");
		}
	}

	//역할: 변경 후 잔액 계산, 부족 잔액 및 오버플로 검증
	private long validateBalanceAfter(Long balanceBefore, Long amount) {
		if (amount < 0 && balanceBefore < -amount) {
			throw new IllegalStateException("포인트 잔액이 부족합니다.");
		}
		try {
			long balanceAfter = Math.addExact(balanceBefore, amount);
			if (balanceAfter < 0) {
				throw new IllegalStateException("포인트 잔액은 음수가 될 수 없습니다.");
			}
			return balanceAfter;
		} catch (ArithmeticException exception) {
			throw new IllegalArgumentException("변경 후 포인트 잔액 범위를 초과했습니다.", exception);
		}
	}

	//역할: 회원 잔액 UPDATE 결과가 정확히 한 행인지 검증
	private void validateBalanceUpdateCount(int updatedRows) {
		if (updatedRows != 1) {
			throw new IllegalStateException("회원 포인트 잔액을 변경하지 못했습니다.");
		}
	}
	
}
