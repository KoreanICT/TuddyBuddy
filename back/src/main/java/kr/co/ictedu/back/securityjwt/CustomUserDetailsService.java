package kr.co.ictedu.back.securityjwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.member.dao.MemberDAO;
import kr.co.ictedu.back.member.vo.MemberVO;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private MemberDAO memberDao;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        MemberVO member = memberDao.getMemberByEmail(email);

        if (member == null) {
            throw new UsernameNotFoundException(
                "존재하지 않는 회원입니다."
            );
        }

        return User.builder()
                .username(member.getMember_email())
                .password(member.getMember_pwd())
                .authorities(member.getAuthority())
                .build();
    }
}