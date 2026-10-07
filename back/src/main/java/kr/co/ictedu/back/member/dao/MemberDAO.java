package kr.co.ictedu.back.member.dao;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.type.Alias;

import kr.co.ictedu.back.member.vo.MemberVO;


// kr.co.ictedu.projectBack.dao.member.MemberDao
@Mapper
public interface MemberDAO {

    // 회원가입
    void insertMember(MemberVO vo);

    // 이메일 중복 확인
    int countByEmail(String email);

    // 이메일 확인
    int checkEmail(String email);

    // 닉네임 중복 확인
    int countByNick(String nick);

    // 이메일로 회원 정보 조회
    MemberVO getMemberByEmail(String email);

    // 회원 정보 수정
    int updateMember(MemberVO vo);

    // 회원 삭제
    int deleteMember(Long mnum);


    // =========================
    // 회원 전체 조회
    // =========================

    List<MemberVO> memberList(Map<String, String> map);

    // 회원 전체 수
    int totalCount(Map<String, String> map);


    // =========================
    // 체크된 회원 등급 변경
    // =========================

    int updateGrade(Map<String, Object> param);

}