package kr.co.ictedu.back.member.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import kr.co.ictedu.back.member.vo.LoginLogVO;

@Mapper
public interface LoginLogDAO {
    int insertLoginLog(LoginLogVO vo);
    int finishLoginLog(@Param("logNum") Long logNum, @Param("memberNum") Long memberNum);
    String findLatestSuccessfulLogin(@Param("memberNum") Long memberNum);
}
