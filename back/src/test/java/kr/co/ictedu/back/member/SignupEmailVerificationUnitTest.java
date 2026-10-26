package kr.co.ictedu.back.member;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.member.service.SignupEmailVerificationService;

class SignupEmailVerificationUnitTest {
    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    private final SignupEmailVerificationService service = new SignupEmailVerificationService(redis);
    private final String email = "member@example.invalid";
    private final String token = "A".repeat(43);

    @Test
    void missingProofIsRejectedBeforeRedisCall() {
        var error = assertThrows(ResponseStatusException.class, () -> service.consume(null, email));
        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(redis);
    }

    @Test
    void invalidProofFormatIsRejected() {
        assertThrows(ResponseStatusException.class, () -> service.consume("forged", email));
        verifyNoInteractions(redis);
    }

    @Test
    void expiredReusedOrMismatchedProofStopsSignup() {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class))).thenReturn(0L);
        assertThrows(ResponseStatusException.class, () -> service.consume(token, email));
    }

    @Test
    void consumptionBindsNormalizedEmailAndHashedToken() {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class))).thenAnswer(call -> {
            List<String> keys = call.getArgument(1);
            assertTrue(keys.getFirst().startsWith("tuddy:signup:email-verified:"));
            assertFalse(keys.getFirst().contains(token));
            assertEquals(email, call.getArgument(2));
            return 1L;
        });
        service.consume(token, " Member@Example.Invalid ");
    }

    @Test
    void proofCanOnlyBeConsumedOnceWhenRedisReturnsConsumedState() {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class))).thenReturn(1L, 0L);
        service.consume(token, email);
        assertThrows(ResponseStatusException.class, () -> service.consume(token, email));
    }

    @Test
    void correctCodeReturnsRandomProofWithTenMinuteTtl() {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class))).thenAnswer(call -> {
            assertEquals(email, call.getArgument(3));
            assertEquals("600", call.getArgument(4));
            return 1L;
        });
        var result = service.verifyCode(email, "ABC123");
        assertTrue(result.isSuccess());
        assertTrue(result.getVerificationToken().matches("[A-Za-z0-9_-]{43}"));
    }

    @Test
    void wrongCodeDoesNotReturnProof() { assertFailedCode(-3L, "wrong"); }

    @Test
    void expiredCodeDoesNotReturnProof() { assertFailedCode(-1L, "expired"); }

    @Test
    void exceededAttemptsDoesNotReturnProof() { assertFailedCode(-2L, "exceeded"); }

    @Test
    void unavailableRedisFailsClosed() {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class)))
                .thenThrow(new DataAccessResourceFailureException("internal"));
        var error = assertThrows(ResponseStatusException.class, () -> service.consume(token, email));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }

    private void assertFailedCode(long status, String reason) {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class))).thenReturn(status);
        var result = service.verifyCode(email, "ABC123");
        assertFalse(result.isSuccess());
        assertEquals(reason, result.getReason());
        assertNull(result.getVerificationToken());
    }
}
