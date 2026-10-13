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

	@Transactional 
	public void payment(Map<String, Object> paymentMap) {
	    Map<String, Object> innerPayment = (Map<String, Object>) paymentMap.get("payment");
	    PointVO vo = new PointVO();
	    Long porintNum = ((Number) innerPayment.get("porint")).longValue();
	    Long priceNum = ((Number) innerPayment.get("price")).longValue();
	    String description = (String) paymentMap.get("description");
	    String point_type = (String) paymentMap.get("point_type"); //PAYMENT
	    
	    //더미데이터 수정 필요 >  세션에서 member_num구할수 있게되면 추가 처리
	    int num = 1;
	    Long balance_before = select_point(Long.valueOf(num));
	    vo.setMember_num(Long.valueOf(num));
	    //-------------------------------------------------------
	    
	    
	    Long balance_after = balance_before + porintNum;

	    
	    vo.setAmount(porintNum);
	    vo.setPayment_price(priceNum);
	    vo.setDescription(description);
	    vo.setPoint_type(point_type);
	    vo.setBalance_before(balance_before);
	    vo.setBalance_after(balance_after);

	    insertPoint(vo);
	}
	
	@Transactional 
	public void  referral(Map<String, Object> referralMap) {
		
	    Map<String, Object> innerReferral = (Map<String, Object>) referralMap.get("referral");
	    String referralCode = (String) innerReferral.get("referralCode");
	    PointVO vo = new PointVO();
	    Long porintNum = ((Number) innerReferral.get("porint")).longValue();
	    Long priceNum = ((Number) innerReferral.get("price")).longValue(); //0원
	    String description = (String) innerReferral.get("description");
	    String point_type = (String) innerReferral.get("point_type"); //PAYMENT
	    
	    //더미데이터 수정 필요 >  세션에서 member_num구할수 있게되면 추가 처리
	    int num = 1;
	    Long balance_before = select_point(Long.valueOf(num));
	    vo.setMember_num(Long.valueOf(num));
	    //-------------------------------------------------------
	    
	    
	    Long balance_after = balance_before + porintNum;

	    
	    vo.setAmount(porintNum);
	    vo.setPayment_price(priceNum);
	    vo.setDescription(description);
	    vo.setPoint_type(point_type);
	    vo.setBalance_before(balance_before);
	    vo.setBalance_after(balance_after);

	    insertPoint(vo);
	}
}
