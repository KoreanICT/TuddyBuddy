package kr.co.ictedu.back.attendance.vo;

import lombok.Getter;
import lombok.Setter;

/** 월별 조회 결과의 출석 한 건을 전달하며 MyBatis가 setter로 조회 값을 채운다. */
@Getter
@Setter
public class AttendanceDayVO {
    /** DB 한국 날짜 기준 출석일(YYYY-MM-DD). */
    private String attendanceDate;
    /** 해당 출석에 기록된 지급 포인트. 과거 보상 미지급 기록은 0이다. */
    private long rewardPoint;
}
