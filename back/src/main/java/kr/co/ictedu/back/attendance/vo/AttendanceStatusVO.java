package kr.co.ictedu.back.attendance.vo;

import java.util.List;

/**
 * 월별 출석 조회 응답. 날짜 문자열은 브라우저 시간대로 변환하지 않고 표시할 수 있다.
 * @param month 조회한 월(YYYY-MM)
 * @param today 요청 중 한 번 읽은 DB 한국 날짜(YYYY-MM-DD)
 * @param timezone 날짜 기준 시간대(Asia/Seoul)
 * @param checkedToday 조회 월과 관계없는 오늘의 출석 여부
 * @param rewardPerCheck 현재 출석 1회 지급 정책이며 0으로 고정
 * @param items 조회 월의 출석일과 기록된 포인트 목록
 */
public record AttendanceStatusVO(String month, String today, String timezone,
        boolean checkedToday, long rewardPerCheck, List<AttendanceDayVO> items) { }
