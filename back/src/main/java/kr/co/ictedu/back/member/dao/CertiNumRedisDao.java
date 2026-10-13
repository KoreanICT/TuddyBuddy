package kr.co.ictedu.back.member.dao;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CertiNumRedisDao {
	@Autowired
	private StringRedisTemplate sRT;
	public void saveCertiNum(String email, String authCode) {
		
		sRT.opsForValue().set(email, authCode, Duration.ofSeconds(10000));
		sRT.opsForValue().set(email + ":attempt", "0", Duration.ofSeconds(10000));
	}
	public String getCertiRedisNum(String email) {
		return sRT.opsForValue().get(email);
	}
	public void delCertiRedisNum(String email) {
		sRT.delete(email);
		sRT.delete(email + ":attempt");
	}
	public boolean hasKey(String email) {
		return sRT.hasKey(email);
	}
	public void incrAttempt(String email) {
		sRT.opsForValue().increment(email + ":attempt");
		
	}
	public int getAttempt(String email) {
		String attemptStr = sRT.opsForValue().get(email + ":attempt");
		// 값이 없다면 0으로 초기회 
		return attemptStr == null ? 0 : Integer.parseInt(attemptStr);
	}
}