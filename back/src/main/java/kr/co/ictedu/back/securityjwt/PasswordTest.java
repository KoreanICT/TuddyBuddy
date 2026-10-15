package kr.co.ictedu.back.securityjwt;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String password = "1234";

        String encodedPassword = encoder.encode(password);

        System.out.println("BCrypt 암호화 결과:");
        System.out.println(encodedPassword);
    }
}
