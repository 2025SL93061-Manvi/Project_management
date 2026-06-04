package com.enterprisepm.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    private static final String SECRET = "thisIsAVeryLongSecretKeyForTestingPurposesOnly123";
    private static final long EXPIRATION = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", EXPIRATION);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        Authentication auth = new UsernamePasswordAuthenticationToken("user@test.com", null);
        String token = jwtTokenProvider.generateToken(auth);
        assertThat(token).isNotBlank();
    }

    @Test
    void getEmailFromToken_returnsCorrectEmail() {
        Authentication auth = new UsernamePasswordAuthenticationToken("user@test.com", null);
        String token = jwtTokenProvider.generateToken(auth);
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("user@test.com");
    }

    @Test
    void validateToken_returnsTrueForValidToken() {
        Authentication auth = new UsernamePasswordAuthenticationToken("user@test.com", null);
        String token = jwtTokenProvider.generateToken(auth);
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_returnsFalseForTamperedToken() {
        assertThat(jwtTokenProvider.validateToken("invalid.token.value")).isFalse();
    }
}
