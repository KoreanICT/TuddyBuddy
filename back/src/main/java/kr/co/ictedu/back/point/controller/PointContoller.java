package kr.co.ictedu.back.point.controller;

import java.sql.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.point.service.PointService;
import kr.co.ictedu.back.point.vo.PointVO;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/point")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PointContoller {
	
	@Autowired
	private PointService service;
	
	@PostMapping("/pointAdd")
	public String pointAdd(@RequestBody Map<String, Object> res) {
//		            paymentId: response.paymentId,
//		           o payment:selectedProduc > { id: 1, porint: 1000, price: 1000 },
//		            description:"포인트 결제",
//		            point_type:"PAYMENT"
		
//		private Long point_num;          // PK, number(10) x
//	    private Long member_num;         // FK, member 테이블 참조, number(10) x
//	    private Long amount;             // 변동 포인트, number(10) o
//	    private Long balance_before;     // 변동 전 포인트 잔액, number(10) o
//	    private Long balance_after;      // 변동 후 포인트 잔액, number(10) o
//	    private Long payment_price;      // 실제 결제/충전 금액, number(10) o
//	    private String point_type;       // 포인트 변동 유형(INIT, PAYMENT 등), varchar2(20) o
//	    private String description;      // 상세 사유, varchar2(200) o
//	    private Date regdate;            // 등록일자, date x
		
		if (!res.isEmpty()) {
			String paymentId = (String) res.get("paymentId");

			if (!paymentId.isEmpty()) {

				service.payment(res);
				return "결제번호 : " +  paymentId + " 처리완료";
			} else {

				return "결제번호 : " +  paymentId + " 처리실패";
			}
		} else {

			return "JOSN비어있음";
		}
	}
	
}
