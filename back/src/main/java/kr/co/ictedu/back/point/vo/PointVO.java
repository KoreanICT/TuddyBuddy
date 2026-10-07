package kr.co.ictedu.back.point.vo;

import java.sql.Date;
import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.Getter;
import lombok.Setter;

@Alias("povo")
@Setter
@Getter
public class PointVO {
	private Long point_num;          // PK, number(10)
    private Long member_num;         // FK, member 테이블 참조, number(10)
    private Long amount;             // 변동 포인트, number(10)
    private Long balance_before;     // 변동 전 포인트 잔액, number(10)
    private Long balance_after;      // 변동 후 포인트 잔액, number(10)
    private Long payment_price;      // 실제 결제/충전 금액, number(10)
    private String point_type;       // 포인트 변동 유형(INIT, PAYMENT 등), varchar2(20)
    private String description;      // 상세 사유, varchar2(200)
    private Date regdate;            // 등록일자, date
}
