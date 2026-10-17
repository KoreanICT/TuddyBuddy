
package kr.co.ictedu.back.member.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.securityauth.MemberRoles;
import kr.co.ictedu.back.securityauth.RefreshTokenService;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@Service
public class MemberService {

	@Autowired
	private MemberDAO memberDao;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private RefreshTokenService refreshTokens;

	// 비밀번호 변경 결과
	public enum PasswordChangeResult {
		SUCCESS, NOT_FOUND, KAKAO_ACCOUNT, INVALID_CURRENT_PASSWORD, INVALID_NEW_PASSWORD, SAME_PASSWORD,
		UPDATE_CONFLICT
	}

	// ==========================================
	// 일반 회원가입
	// ==========================================
	public void create(MemberVO vo) {
        vo.setAuthority(MemberRoles.MEMBER);

		System.out.println("1");

		if (memberDao.countByEmail(vo.getMember_email()) > 0) {
			throw new RuntimeException("이미 사용 중인 이메일입니다.");
		}

		if (memberDao.countByNick(vo.getMember_nick()) > 0) {
			throw new RuntimeException("이미 사용 중인 닉네임입니다.");
		}

		System.out.println("4");

		vo.setMember_pwd(passwordEncoder.encode(vo.getMember_pwd()));

		String memberCode = UUID.randomUUID().toString();
		vo.setMember_code(memberCode);

		System.out.println("생성된 회원코드 : " + memberCode);

		memberDao.insertMember(vo);

		System.out.println("5");
	}

	// ==========================================
	// 카카오 회원가입
	// ==========================================
	@Transactional
	public MemberVO createKakaoMember(String kakaoId, String email, String name, String nick, String phone) {

		// 필수 정보 검사
		if (kakaoId == null || kakaoId.isBlank()) {
			throw new IllegalArgumentException("카카오 사용자 인증정보가 없습니다.");
		}

		if (email == null || email.isBlank() || name == null || name.isBlank() || nick == null || nick.isBlank()
				|| phone == null || phone.isBlank()) {

			throw new IllegalArgumentException("필수 정보를 모두 입력해주세요.");
		}

		String normalizedEmail = email.trim().toLowerCase();

		String normalizedName = name.trim();
		String normalizedNick = nick.trim();
		String normalizedPhone = phone.trim();

		if (!Pattern.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", normalizedEmail)) {

			throw new IllegalArgumentException("올바른 이메일을 입력해주세요.");
		}

		// 닉네임 유효성 검사
		if (normalizedNick.length() < 2 || normalizedNick.length() > 12) {

			throw new IllegalArgumentException("닉네임은 2~12자로 입력해주세요.");
		}

		if (!Pattern.matches("^[가-힣a-zA-Z0-9]+$", normalizedNick)) {

			throw new IllegalArgumentException("닉네임은 완성형 한글, 영문, 숫자만 사용할 수 있습니다.");
		}

		if (Pattern.matches("^[0-9]+$", normalizedNick)) {

			throw new IllegalArgumentException("숫자로만 이루어진 닉네임은 사용할 수 없습니다.");
		}

		String lowerNick = normalizedNick.toLowerCase();

		if (List.of("관리자", "운영자", "admin", "administrator").contains(lowerNick)) {

			throw new IllegalArgumentException("사용할 수 없는 닉네임입니다.");
		}

		// 기존 카카오 계정 확인
		MemberVO existingMember = memberDao.findBySocialLogin("KAKAO", kakaoId);

		if (existingMember != null) {
			throw new IllegalArgumentException("이미 가입된 카카오 계정입니다.");
		}

		// 이메일 중복 확인
		if (memberDao.countByEmail(normalizedEmail) > 0) {
			throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
		}

		// 닉네임 중복 확인
		if (memberDao.countByNick(normalizedNick) > 0) {
			throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
		}

		// 카카오 회원정보 생성
		MemberVO vo = new MemberVO();

		vo.setMember_email(normalizedEmail);
		vo.setMember_name(normalizedName);
		vo.setMember_nick(normalizedNick);
		vo.setMember_phone(normalizedPhone);

		vo.setAuthority(MemberRoles.MEMBER);

		vo.setMember_login_type("KAKAO");
		vo.setMember_social_id(kakaoId);
		vo.setPoint(0);

		// 카카오 회원의 일반 로그인 방지용 임의 비밀번호
		vo.setMember_pwd(passwordEncoder.encode(UUID.randomUUID().toString() + UUID.randomUUID().toString()));

		vo.setMember_code(UUID.randomUUID().toString());

		// Oracle 저장
		memberDao.insertKakaoMember(vo);

		// 저장된 회원정보 재조회
		MemberVO savedMember = memberDao.findBySocialLogin("KAKAO", kakaoId);

		if (savedMember == null) {
			throw new IllegalStateException("카카오 회원정보 저장 후 조회에 실패했습니다.");
		}

		System.out.println("===== 카카오 회원가입 완료 =====");

		System.out.println("회원번호: " + savedMember.getMember_num());

		return savedMember;
	}

	// ==========================================
	// 일반 회원 비밀번호 변경
	// ==========================================
	@Transactional
	public PasswordChangeResult changePassword(String email, String currentPassword, String newPassword) {

		// 회원정보 조회
		if (email == null || email.isBlank()) {
			return PasswordChangeResult.NOT_FOUND;
		}

		MemberVO member = memberDao.getMemberByEmail(email);

		if (member == null) {
			return PasswordChangeResult.NOT_FOUND;
		}

		// 카카오 회원 비밀번호 변경 차단
		if ("KAKAO".equalsIgnoreCase(member.getMember_login_type())) {

			return PasswordChangeResult.KAKAO_ACCOUNT;
		}

		// 현재 비밀번호 확인
		String encodedPassword = member.getMember_pwd();

		if (encodedPassword == null || encodedPassword.isBlank() || currentPassword == null
				|| !passwordEncoder.matches(currentPassword, encodedPassword)) {

			return PasswordChangeResult.INVALID_CURRENT_PASSWORD;
		}

		// 새 비밀번호 검사
		if (newPassword == null || newPassword.length() < 8 || newPassword.length() > 72
				|| !newPassword.matches(".*[a-zA-Z].*") || !newPassword.matches(".*[0-9].*")) {

			return PasswordChangeResult.INVALID_NEW_PASSWORD;
		}

		// 현재 비밀번호와 동일한 경우
		if (passwordEncoder.matches(newPassword, encodedPassword)) {

			return PasswordChangeResult.SAME_PASSWORD;
		}

		// BCrypt 암호화
		String newEncodedPassword = passwordEncoder.encode(newPassword);

		// 비밀번호 저장
		// 조회 시점의 비밀번호가 그대로일 때만 변경
		int result = memberDao.updatePasswordIfUnchanged(
				member.getMember_num(), newEncodedPassword, encodedPassword);

		if (result != 1) {
			return PasswordChangeResult.UPDATE_CONFLICT;
		}

		refreshTokens.revokeAll(member.getMember_num());

		System.out.println("===== 비밀번호 DB 변경 완료 =====");

		return PasswordChangeResult.SUCCESS;
	}

	// ==========================================
	// 닉네임 중복 확인
	// ==========================================
	public int checkNick(String nick) {
		return memberDao.countByNick(nick);
	}

	public int countByNickExcludingMember(String nick, Long memberNum) {
		return memberDao.countByNickExcludingMember(nick, memberNum);
	}

	// ==========================================
	// 이메일로 회원 조회
	// ==========================================
	public MemberVO getMemberByEmail(String email) {
		return memberDao.getMemberByEmail(email);
	}

	// ==========================================
	// 회원정보 수정
	// ==========================================
	public int updateMember(MemberVO vo) {
		return memberDao.updateMember(vo);
	}

	// ==========================================
	// 회원 탈퇴
	// ==========================================
	@Transactional
	public boolean withdrawMember(Long mnum) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO actor = memberDao.getMemberByEmail(authentication.getName());
        if (actor == null || mnum == null || !mnum.equals(actor.getMember_num())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 계정만 탈퇴할 수 있습니다.");
        }
        MemberVO target = memberDao.lockMemberByNum(mnum);
        if (target == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다.");
        }
        if (MemberRoles.ADMIN.equals(target.getAuthority())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "최고 관리자 계정은 DB 관리자가 관리합니다.");
        }
        if (memberDao.deleteMember(mnum) != 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "회원 탈퇴에 실패했습니다.");
        }
        refreshTokens.revokeAll(mnum);
        return true;
	}

	// ==========================================
	// 회원 전체 조회
	// ==========================================
	public List<MemberVO> list(Map<String, String> map) {

		return memberDao.memberList(map);
	}

	// ==========================================
	// 회원 전체 수
	// ==========================================
	public int totalCount(Map<String, String> map) {

		return memberDao.totalCount(map);
	}

	// ==========================================
	// 선택된 회원 등급 변경
	// ==========================================
	@Transactional
	public int updateGrade(Map<String, Object> param) {
        Object memberNums = param.get("memberNums");
        Object authority = param.get("authority");
        if (!(memberNums instanceof List<?> numbers) || numbers.isEmpty()
                || !(authority instanceof String role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원 번호와 권한이 필요합니다.");
        }
        int updated = 0;
        for (Object number : numbers) {
            if (!(number instanceof Number)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원 번호가 올바르지 않습니다.");
            }
            updated += updateManagedAuthority(((Number) number).longValue(), role);
        }
        return updated;
	}

    @Transactional
    public int updateManagedAuthority(Long memberNum, String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        MemberVO actor = memberDao.getMemberByEmail(authentication.getName());
        if (actor == null || !MemberRoles.ADMIN.equals(actor.getAuthority())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "최고 관리자만 권한을 변경할 수 있습니다.");
        }
        if (memberNum == null || memberNum <= 0
                || !(MemberRoles.MEMBER.equals(authority) || MemberRoles.SUB_ADMIN.equals(authority))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원 번호 또는 변경할 권한이 올바르지 않습니다.");
        }
        MemberVO target = memberDao.lockMemberByNum(memberNum);
        if (target == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다.");
        }
        if (!MemberRoles.MEMBER.equals(target.getAuthority()) && !MemberRoles.SUB_ADMIN.equals(target.getAuthority())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 계정의 권한은 DB 관리자만 변경할 수 있습니다.");
        }
        int updated = memberDao.updateManagedAuthority(memberNum, authority);
        if (updated != 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "권한 변경에 실패했습니다.");
        }
        return updated;
    }

	// ==========================================
	// 이메일 중복 확인
	// ==========================================
	public int checkemail(String email) {
		return memberDao.countByEmail(email);
	}

	// ==========================================
	// 회원 코드로 회원 검색
	// ==========================================
	public MemberVO findByMemberCode(String member_code) {

		if (member_code == null || member_code.isBlank()) {

			throw new IllegalArgumentException("회원 코드를 입력해주세요.");
		}

		return memberDao.findByMemberCode(member_code.trim());
	}

	// ==========================================
	// 회원 번호로 상세 조회
	// ==========================================
	public Map<String, Object> getMemberProfile(Long member_num) {

		if (member_num == null || member_num <= 0) {

			throw new IllegalArgumentException("회원 번호가 올바르지 않습니다.");
		}

		return memberDao.getMemberProfile(member_num);
	}
}
