
package kr.co.ictedu.back.member.service;

import java.util.List;
import java.util.Map;
import java.util.UUID; // 추가: UUID 생성

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@Service
public class MemberService {

    @Autowired
    private MemberDAO memberDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =========================
    // 회원가입
    // =========================
    public void create(MemberVO vo) {

        System.out.println("1");

        // 이메일 중복 확인
        if (memberDao.countByEmail(vo.getMember_email()) > 0) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        // 닉네임 중복 확인
        if (memberDao.countByNick(vo.getMember_nick()) > 0) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }

        System.out.println("4");

        // 비밀번호 BCrypt 암호화
        vo.setMember_pwd(
            passwordEncoder.encode(vo.getMember_pwd())
        );

        // =========================
        // 추가: 회원코드 UUID 랜덤 생성
        // =========================
        String memberCode = UUID.randomUUID().toString();
        vo.setMember_code(memberCode);

        System.out.println("생성된 회원코드 : " + memberCode);

        // 회원가입
        memberDao.insertMember(vo);

        System.out.println("5");
    }

    // =========================
    // 닉네임 중복 확인
    // =========================
    public int checkNick(String nick) {
        return memberDao.countByNick(nick);
    }

    // =========================
    // 이메일로 회원 조회
    // =========================
    public MemberVO getMemberByEmail(String email) {
        return memberDao.getMemberByEmail(email);
    }

    // =========================
    // 회원 정보 수정
    // =========================
    public int updateMember(MemberVO vo) {
        return memberDao.updateMember(vo);
    }

    // =========================
    // 회원 탈퇴
    // =========================
    @Transactional
    public boolean withdrawMember(Long mnum) {

        int result = memberDao.deleteMember(mnum);

        System.out.println("deleteMember result = " + result);

        return result > 0;
    }

    // =========================
    // 회원 전체 조회
    // =========================
    public List<MemberVO> list(Map<String, String> map) {
        return memberDao.memberList(map);
    }

    // =========================
    // 회원 전체 수
    // =========================
    public int totalCount(Map<String, String> map) {
        return memberDao.totalCount(map);
    }

    // =========================
    // 선택된 회원 등급 변경
    // =========================
    public int updateGrade(Map<String, Object> param) {
        return memberDao.updateGrade(param);
    }

    // =========================
    // 이메일 중복 확인
    // =========================
    public int checkemail(String email) {
        return memberDao.countByEmail(email);
    }

    // 담당 인원 : 주용현
    // 회원 코드로 회원 검색
    public MemberVO findByMemberCode(String member_code) {
        if (member_code == null || member_code.isBlank()) {
            throw new IllegalArgumentException("회원 코드를 입력해주세요.");
        }

        return memberDao.findByMemberCode(member_code.trim());
    }
}
