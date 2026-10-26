package kr.co.ictedu.back.attendance.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import kr.co.ictedu.back.attendance.vo.AttendanceDayVO;

/** AttendanceMapper.xml의 동일 이름 SQL과 연결되는 출석 전용 데이터 접근 계약이다. */
@Mapper
public interface AttendanceDao {
    /** DB 시계의 Asia/Seoul 오늘을 YYYY-MM-DD 문자열로 반환한다. */
    String getToday();
    /** memberNum은 인증된 회원번호, monthStart는 서버가 검증한 조회 월 첫날(YYYY-MM-DD)이다. */
    List<AttendanceDayVO> findMonth(@Param("memberNum") Long memberNum,
            @Param("monthStart") String monthStart);
    /** 서버가 한 번 읽은 today에 해당 회원의 출석이 있는지 건수로 확인한다. */
    int existsToday(@Param("memberNum") Long memberNum, @Param("today") String today);
    /** 동일한 서버 today와 서버가 결정한 보상 포인트로 출석 한 건을 저장한다. */
    int insertToday(@Param("memberNum") Long memberNum, @Param("today") String today,
            @Param("rewardPoint") long rewardPoint);
}
