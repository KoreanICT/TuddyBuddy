package kr.co.ictedu.back.member.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.member.vo.MemberVO;

@Mapper
public interface MemberDAO {
    List<Long> findManagerNums();
    List<String> findRecoveryEmails(@Param("name") String name, @Param("phone") String phone);

	// 일반 회원가입
	void insertMember(MemberVO vo);

	// 카카오 회원가입 추가
	void insertKakaoMember(MemberVO vo);

	// 이메일 중복 확인
	int countByEmail(String email);

	// 이메일 확인
	int checkEmail(String email);

	// 닉네임 중복 확인
	int countByNick(String nick);

	int countByNickExcludingMember(@Param("nick") String nick, @Param("memberNum") Long memberNum);

	int updatePasswordIfUnchanged(@Param("memberNum") Long memberNum,
			@Param("newPassword") String newPassword, @Param("currentPassword") String currentPassword);

	// 이메일로 회원 조회
	MemberVO getMemberByEmail(String email);

	// 회원 정보 수정
	int updateMember(MemberVO vo);

	// 회원 삭제
	int deleteMember(Long mnum);

	// 회원 전체 조회
	List<MemberVO> memberList(Map<String, String> map);

	// 회원 전체 수
	int totalCount(Map<String, String> map);

	// 카카오 소셜 로그인 회원 조회
	MemberVO findBySocialLogin(@Param("loginType") String loginType, @Param("socialId") String socialId);

	MemberVO lockMemberByNum(@Param("memberNum") Long memberNum);

	int updateManagedAuthority(@Param("memberNum") Long memberNum, @Param("authority") String authority);

	// 체크된 회원 등급 변경
	int updateGrade(Map<String, Object> param);

	// 회원 코드로 회원 검색
	MemberVO findByMemberCode(@Param("member_code") String member_code);

	// 회원 번호로 회원 정보 상세 조회
	Map<String, Object> getMemberProfile(@Param("member_num") Long member_num);
}
