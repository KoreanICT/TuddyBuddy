package kr.co.ictedu.back.timer.dao;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import kr.co.ictedu.back.timer.vo.TimerSessionVO;
import kr.co.ictedu.back.timer.vo.TimerVO;
@Mapper
public interface TimerDao {
    int insertSession(TimerSessionVO session);
    TimerSessionVO lockSession(@Param("sessionId") Long sessionId, @Param("memberNum") Long memberNum);
    List<TimerVO> selectIntervals(@Param("sessionId") Long sessionId);
    int insertInterval(TimerVO timer);
    int updateTotal(@Param("sessionId") Long sessionId, @Param("seconds") long seconds);
    long selectTotal(@Param("memberNum") Long memberNum);
    List<TimerSessionVO> selectRecent(@Param("memberNum") Long memberNum);
}
