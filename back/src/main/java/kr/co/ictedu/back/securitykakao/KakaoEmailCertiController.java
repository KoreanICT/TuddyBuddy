
package kr.co.ictedu.back.securitykakao;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.member.dao.CertiNumRedisDao;
import kr.co.ictedu.back.member.service.EmailSender;
@RestController
@RequestMapping("/api/auth/kakao/email")
public class KakaoEmailCertiController {

    private final EmailSender emailSender;
    private final CertiNumRedisDao certiNumRedisDao;
    private final EmailVerifiedRedisDao emailVerifiedRedisDao;
    private final KakaoSignupRedisDao kakaoSignupRedisDao;

    public KakaoEmailCertiController(
            EmailSender emailSender,
            CertiNumRedisDao certiNumRedisDao,
            EmailVerifiedRedisDao emailVerifiedRedisDao,
            KakaoSignupRedisDao kakaoSignupRedisDao) {

        this.emailSender = emailSender;
        this.certiNumRedisDao = certiNumRedisDao;
        this.emailVerifiedRedisDao = emailVerifiedRedisDao;
        this.kakaoSignupRedisDao = kakaoSignupRedisDao;
    }

    // ==========================================
    // 1. 카카오 회원가입 이메일 인증번호 발송
    // ==========================================
    @PostMapping("/send")
    public ResponseEntity<?> send(
            @RequestBody Map<String, String> request) {

        String signupToken = request.get("signupToken");
        String email = request.get("email");

        if (signupToken == null ||
                kakaoSignupRedisDao.getKakaoId(signupToken) == null) {

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "카카오 가입 인증이 만료되었습니다."
            ));
        }

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "이메일을 입력해주세요."
            ));
        }

        email = email.trim().toLowerCase();

        // 기존 이메일 중복 확인 기능 재사용
        if (emailSender.duplicateEmail(email) != 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "이미 사용 중인 이메일입니다."
            ));
        }

        // 기존 이메일 발송 기능 재사용
        emailSender.sendEmail(email);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "인증번호가 발송되었습니다."
        ));
    }

    // ==========================================
    // 2. 인증번호 확인 및 인증 증명값 발급
    // ==========================================
    @PostMapping("/verify")
    public ResponseEntity<?> verify(
            @RequestBody Map<String, String> request) {

        String signupToken = request.get("signupToken");
        String email = request.get("email");
        String code = request.get("code");

        if (signupToken == null ||
                kakaoSignupRedisDao.getKakaoId(signupToken) == null) {

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "카카오 가입 인증이 만료되었습니다."
            ));
        }

        if (email == null || email.isBlank() ||
                code == null || code.isBlank()) {

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "이메일과 인증번호를 입력해주세요."
            ));
        }

        email = email.trim().toLowerCase();

        if (!certiNumRedisDao.hasKey(email)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "인증번호가 만료되었습니다."
            ));
        }

        if (certiNumRedisDao.getAttempt(email) >= 3) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "인증 시도 횟수를 초과했습니다."
            ));
        }

        String savedCode =
                certiNumRedisDao.getCertiRedisNum(email);

        if (savedCode == null ||
                !savedCode.equals(code.trim())) {

            certiNumRedisDao.incrAttempt(email);

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "인증번호가 일치하지 않습니다."
            ));
        }

        // 인증 성공 시 기존 인증번호 삭제
        certiNumRedisDao.delCertiRedisNum(email);

        // 인증된 이메일에 대한 일회성 증명값 발급
        String verificationToken =
                emailVerifiedRedisDao.createVerificationToken(email);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "verificationToken", verificationToken,
                "message", "이메일 인증이 완료되었습니다."
        ));
    }
}
