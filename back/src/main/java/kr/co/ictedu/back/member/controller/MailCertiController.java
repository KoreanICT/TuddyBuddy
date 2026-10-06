package kr.co.ictedu.back.member.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.ictedu.back.member.dao.CertiNumRedisDao;
import kr.co.ictedu.back.member.service.EmailSender;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.EmailCheckVO;
import kr.co.ictedu.back.member.vo.EmailCountCheckVO;

@CrossOrigin(
    origins = "http://localhost:3000",
    allowCredentials = "true"
)
@RestController
@RequestMapping("/api/auth")
public class MailCertiController {

    @Autowired
    private EmailSender emailSender;

    @Autowired
    private CertiNumRedisDao certiNumRedisDao;

    @Autowired
    private MemberService memberService;


    // =========================
    // 닉네임 중복 확인
    // =========================
    @PostMapping("/nickCheck")
    public int checkNick(
            @RequestBody Map<String, String> request) {

        String nick = request.get("nick");

        System.out.println(
                "닉네임 중복확인 요청: " + nick
        );

        int checkNick =
                memberService.checkNick(nick);

        return (checkNick == 0) ? 0 : 1;
    }


    // =========================
    // 이메일 중복확인 + 인증번호 발송
    // =========================
    @PostMapping("/emailCheck")
    public int sendEmail(
            @RequestBody EmailCheckVO email) {

        System.out.println(
                "이메일 인증 요청: "
                + email.getEmail()
        );

        int checkEmail =
                emailSender.duplicateEmail(
                        email.getEmail()
                );

        if (checkEmail == 0) {

            emailSender.sendEmail(
                    email.getEmail()
            );

            return 0;
        }

        return 1;
    }


    // =========================
    // 인증번호 확인
    // =========================
    @PostMapping("/emailCheck/certi")
    public ResponseEntity<EmailCountCheckVO>
            verifyCertificationNumber(
                    @RequestBody EmailCheckVO dto) {

        String email = dto.getEmail();
        String code = dto.getCode();

        boolean hasKey =
                certiNumRedisDao.hasKey(email);

        int attempts =
                certiNumRedisDao.getAttempt(email);


        // 인증번호 만료
        if (!hasKey) {

            return ResponseEntity.ok(
                    new EmailCountCheckVO(
                            false,
                            "expired"
                    )
            );
        }


        // 3회 이상 실패
        if (attempts >= 3) {

            return ResponseEntity.ok(
                    new EmailCountCheckVO(
                            false,
                            "exceeded"
                    )
            );
        }


        String savedCode =
                certiNumRedisDao
                        .getCertiRedisNum(email);


        // 인증 성공
        if (savedCode != null
                && savedCode.equals(code)) {

            certiNumRedisDao
                    .delCertiRedisNum(email);

            return ResponseEntity.ok(
                    new EmailCountCheckVO(
                            true,
                            "ok"
                    )
            );
        }


        // 인증 실패 횟수 증가
        certiNumRedisDao.incrAttempt(email);

        return ResponseEntity.ok(
                new EmailCountCheckVO(
                        false,
                        "wrong"
                )
        );
    }
}