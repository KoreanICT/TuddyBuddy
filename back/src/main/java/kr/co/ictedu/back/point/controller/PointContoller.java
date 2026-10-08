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
