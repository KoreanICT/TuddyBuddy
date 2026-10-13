package kr.co.ictedu.back.member.service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import kr.co.ictedu.back.member.dao.CertiNumRedisDao;
import kr.co.ictedu.back.member.dao.MemberDAO;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
public class EmailSender {
	@Autowired
	private JavaMailSender emailSender;
	
	@Autowired
	private MemberDAO memberDao;
	@Autowired
	private CertiNumRedisDao certiNumRedisDao;
	
	private String authCode;
	
	@Value("${mail.from.address}")
    private String mailFrom;
	
	public int duplicateEmail (String email) {
		int checkEmail = memberDao.countByEmail(email);
		return checkEmail > 0 ? 1 : 0;
	}
	public void createAuthCode() {

		int length = 6;
		StringBuilder authCode = new StringBuilder();
		Random ran = new Random();
		for (int i = 0; i < length; i++) {
			int type = ran.nextInt(3);
			switch (type) {
			case 0:
				authCode.append(ran.nextInt(10));
				break;
			case 1:
				authCode.append((char) (ran.nextInt(26) + 65));
				break;
			case 2:
				authCode.append((char) (ran.nextInt(26) + 97));
				break;
			}

		}
		this.authCode = authCode.toString();
	}
	public void sendEmail (String toEmail) {
		createAuthCode();
		MimeMessage mmsg = emailSender.createMimeMessage();
		try {
			MimeMessageHelper helper = new MimeMessageHelper(mmsg, true);
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
			emailSender.send(mmsg);
		
			certiNumRedisDao.saveCertiNum(toEmail, authCode);
		} catch (MessagingException e) {
			e.printStackTrace();
		}
	}
	public boolean isVerify (String email, String authCode) {
		final int MAX_ATTEMPT = 5;
		if(!certiNumRedisDao.hasKey(email)) {
			return false;
		}
		int attemptCnt  = certiNumRedisDao.getAttempt(email);
		if(attemptCnt >= MAX_ATTEMPT) {
			System.out.println("인증 실패: 최대 인증 시도 초과 :"+attemptCnt);
			return false;
		}
		System.out.println("------------------------------------------------");
		System.out.println("Redis의 이메일:"+certiNumRedisDao.hasKey(email));
		System.out.println("Redis의 인증코드:"+authCode);
		System.out.println("------------------------------------------------");
	
		String savedCode = certiNumRedisDao.getCertiRedisNum(email);
		
		if (savedCode != null && savedCode.equals(authCode)) {
		
			certiNumRedisDao.delCertiRedisNum(email);
			return true;
		}else {
			certiNumRedisDao.incrAttempt(email);
			System.out.println("인증 실패 (" + (attemptCnt + 1) + "회)");
			return false;
		}
		
	}
}