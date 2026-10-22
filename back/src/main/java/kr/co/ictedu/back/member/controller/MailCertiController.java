// 최원철
package kr.co.ictedu.back.member.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.member.service.EmailSender;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.service.SignupEmailVerificationService;
import kr.co.ictedu.back.member.vo.EmailCheckVO;
import kr.co.ictedu.back.member.vo.EmailCountCheckVO;

//@CrossOrigin(
//    origins = "http://localhost:3000",
//    allowCredentials = "true"
//)
@RestController
@RequestMapping("/api/auth")
public class MailCertiController {

    @Autowired
    private EmailSender emailSender;

    @Autowired
    private MemberService memberService;

    @Autowired
    private SignupEmailVerificationService signupVerification;

    // 닉네임 중복 확인
    @PostMapping("/nickCheck")
    public int checkNick(@RequestBody Map<String, String> request) {

        String nick = request.get("nick");

        System.out.println("닉네임 중복확인 요청: " + nick);

        int checkNick = memberService.checkNick(nick);

        return (checkNick == 0) ? 0 : 1;
    }

    // 이메일 중복확인 + 인증번호 발송
    @PostMapping("/emailCheck")
    public int sendEmail(@RequestBody EmailCheckVO email) {

        String normalizedEmail = SignupEmailVerificationService.normalizeEmail(email.getEmail());
        int checkEmail = emailSender.duplicateEmail(normalizedEmail);

        if (checkEmail == 0) {
            emailSender.sendEmail(normalizedEmail);
            return 0;
        }

        return 1;
    }

    // 인증번호 확인
    @PostMapping("/emailCheck/certi")
    public ResponseEntity<EmailCountCheckVO> verifyCertificationNumber(
            @RequestBody EmailCheckVO dto) {

        return ResponseEntity.ok(signupVerification.verifyCode(dto.getEmail(), dto.getCode()));
    }
}
