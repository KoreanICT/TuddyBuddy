
package kr.co.ictedu.back.member.service;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import kr.co.ictedu.back.member.dao.CertiNumRedisDao;
import kr.co.ictedu.back.member.dao.MemberDAO;

@Service
public class EmailSender {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private MemberDAO memberDao;

    @Autowired
    private CertiNumRedisDao certiNumRedisDao;

    @Value("${mail.from.address}")
    private String mailFrom;

    private final SecureRandom random = new SecureRandom();

    // =========================
    // 이메일 중복 확인
    // =========================
    public int duplicateEmail(String email) {
        int checkEmail = memberDao.countByEmail(email);
        return checkEmail > 0 ? 1 : 0;
    }

    // =========================
    // 인증번호 생성
    // =========================
    public String createAuthCode() {

        int length = 6;

        StringBuilder authCode = new StringBuilder();

        String chars =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (int i = 0; i < length; i++) {
            authCode.append(
                chars.charAt(random.nextInt(chars.length()))
            );
        }

        return authCode.toString();
    }

    // =========================
    // 이메일 인증번호 발송
    // =========================
    public void sendEmail(String toEmail) {

        String authCode = createAuthCode();

        System.out.println("====================================");
        System.out.println("이메일 인증 요청 시작");
        System.out.println("수신 이메일 : " + toEmail);
        System.out.println("====================================");

        MimeMessage mmsg = emailSender.createMimeMessage();

        try {

            MimeMessageHelper helper =
                new MimeMessageHelper(mmsg, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(toEmail);
            helper.setSubject("회원가입 인증번호 발송");

            StringBuilder body = new StringBuilder();

            body.append("<html><body>");
            body.append("<h1>회원가입을 위한 인증번호</h1>");
            body.append("<p>회원가입을 완료하기 위해 아래의 인증코드를 입력해주세요.</p>");
            body.append("<p>인증코드: <strong>");
            body.append(authCode);
            body.append("</strong></p>");
            body.append("</body></html>");

            helper.setText(body.toString(), true);

            // =========================
            // 1. SMTP 이메일 발송
            // =========================
            System.out.println("[1] SMTP 이메일 발송 시도");

            emailSender.send(mmsg);

            System.out.println("[2] SMTP 서버 발송 요청 성공");

            // =========================
            // 2. Redis 인증번호 저장
            // =========================
            System.out.println("[3] Redis 인증번호 저장 시도");

            certiNumRedisDao.saveCertiNum(toEmail, authCode);

            System.out.println("[4] Redis 인증번호 저장 성공");

            System.out.println("이메일 인증 처리 완료");
            System.out.println("====================================");

        } catch (MessagingException e) {

            System.err.println("이메일 메시지 생성 오류");
            System.err.println("오류 내용 : " + e.getMessage());

            e.printStackTrace();

            throw new RuntimeException("이메일 메시지 생성 실패", e);

        } catch (MailException e) {

            System.err.println("SMTP 이메일 발송 오류");
            System.err.println("오류 내용 : " + e.getMessage());

            e.printStackTrace();

            throw new RuntimeException("SMTP 이메일 발송 실패", e);

        } catch (Exception e) {

            System.err.println("이메일 인증 처리 중 오류 발생");
            System.err.println("오류 내용 : " + e.getMessage());

            e.printStackTrace();

            throw new RuntimeException("이메일 인증 처리 실패", e);
        }
    }

    // =========================
    // 이메일 인증번호 검증
    // =========================
    public boolean isVerify(String email, String authCode) {

        final int MAX_ATTEMPT = 5;

        if (!certiNumRedisDao.hasKey(email)) {
            System.out.println("인증 실패: Redis 인증정보 없음");
            return false;
        }

        int attemptCnt = certiNumRedisDao.getAttempt(email);

        if (attemptCnt >= MAX_ATTEMPT) {

            System.out.println(
                "인증 실패: 최대 인증 시도 초과 : " + attemptCnt
            );

            return false;
        }

        System.out.println("--------------------------------");
        System.out.println("Redis 이메일 인증정보 존재 : true");
        System.out.println("--------------------------------");

        String savedCode =
            certiNumRedisDao.getCertiRedisNum(email);

        if (savedCode != null && savedCode.equals(authCode)) {

            certiNumRedisDao.delCertiRedisNum(email);

            System.out.println("이메일 인증 성공");

            return true;

        } else {

            certiNumRedisDao.incrAttempt(email);

            System.out.println(
                "인증 실패 (" + (attemptCnt + 1) + "회)"
            );

            return false;
        }
    }
}
